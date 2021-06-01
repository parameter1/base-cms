const getDefaultContentTypes = require('./get-default-content-types');

const { isArray } = Array;

module.exports = ({
  excludeContentIds = [],
  contentTypes = [],
  excludeContentTypes = [],
  since,
  after,
  primarySite,
} = {}) => {
  const now = new Date();
  const date = since || now;
  const types = isArray(contentTypes) && contentTypes.length
    ? contentTypes : getDefaultContentTypes();

  const type = { $in: types };
  if (isArray(excludeContentTypes) && excludeContentTypes.length) {
    type.$nin = excludeContentTypes;
  }

  const query = {
    status: 1,
    type,
    published: {
      $lte: date,
      ...(after && { $gte: after }),
    },
    ...(primarySite && { 'mutations.Website.primarySite': primarySite }),
    $and: [
      {
        $or: [
          { unpublished: { $gt: now } },
          { unpublished: { $exists: false } },
        ],
      },
    ],
  };
  if (isArray(excludeContentIds) && excludeContentIds.length) {
    query._id = { $nin: excludeContentIds };
  }
  return query;
};
