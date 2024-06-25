const { createBaseDB } = require('@parameter1/base-cms-db');

const { log } = console;

/**
 * (Re-)Generates sectionQuery data for the provided tenant
 *
 * @param String tenantKey The BaseCMS tenant key
 * @param Object client A MongoDB client
 * @param Function logger A logging function
 * @param Object context Additional context for the BaseDB instance
 * @param Date maxDate The maximum date to use for the query
 * @param Boolean createIndexes Whether to create indexes on the collection
 *
 * @returns Promise
 */
module.exports = async ({
  tenant,
  client,
  context = {},
  logger = log,
  maxDate = new Date('2038-01-01'),
  createIndexes = false,
}) => {
  const basedb = createBaseDB({ tenant, client, context });
  const [scheduleColl, contentColl] = await Promise.all([
    basedb.collection('website', 'Schedule'),
    basedb.collection('platform', 'Content'),
  ]);

  logger('Retrieving aggregated schedules...');
  const cursor = await scheduleColl.aggregate([
    {
      $match: {
        status: 1,
        contentStatus: 1,
        published: { $exists: true },
        product: { $exists: true },
        section: { $exists: true },
        option: { $exists: true },
        'content.$id': { $exists: true },
      },
    },
    { $addFields: { contentArray: { $objectToArray: '$content' } } },
    { $unwind: '$contentArray' },
    { $match: { 'contentArray.k': '$id' } },
    {
      $project: {
        contentId: '$contentArray.v',
        sectionId: '$section',
        optionId: '$option',
        siteId: '$product',
        start: {
          $cond: {
            if: { $gt: ['$startDate', '$published'] },
            then: '$startDate',
            else: '$published',
          },
        },
        end: {
          $cond: {
            if: {
              $lt: [
                { $ifNull: ['$endDate', maxDate] },
                { $ifNull: ['$expires', maxDate] },
              ],
            },
            then: '$endDate',
            else: '$expires',
          },
        },
        scheduled: '$startDate',
      },
    },
    { $sort: { start: -1 } },
    {
      $group: {
        _id: '$contentId',
        schedules: {
          $push: {
            sectionId: '$sectionId',
            optionId: '$optionId',
            siteId: '$siteId',
            start: '$start',
            end: '$end',
            scheduled: '$scheduled',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        contentId: '$_id',
        schedules: 1,
      },
    },
  ], { allowDiskUse: true });

  const docs = await cursor.toArray();

  logger(`Found ${docs.length} content items with schedules.`);
  logger('Beginning bulk write process...');

  const bulkOps = docs.map((doc) => ({
    updateOne: {
      filter: { _id: doc.contentId },
      update: { $set: { sectionQuery: doc.schedules } },
    },
  }));

  const { matchedCount } = await contentColl.bulkWrite(bulkOps);
  logger('Bulk write complete.', matchedCount);

  const { matchedCount: unbuiltCount } = await contentColl.bulkWrite([{
    updateMany: {
      filter: { status: 0, sectionQuery: { $exists: true } },
      update: { $unset: { sectionQuery: '' } },
    },
  }]);
  logger('Bulk unbuild complete.', unbuiltCount);

  if (createIndexes) {
    logger('Creating indices...');
    await Promise.all([
      contentColl.createIndex({ 'sectionQuery.sectionId': 1, 'sectionQuery.optionId': 1 }),
      contentColl.createIndex({ 'sectionQuery.sectionId': 1, 'sectionQuery.optionId': 1, primaryImage: 1 }),
      contentColl.createIndex({ 'sectionQuery.start': -1, _id: -1 }),
      contentColl.createIndex({ 'sectionQuery.end': -1, _id: -1 }),
    ]);
    logger('Indexing complete.');
  }
};
