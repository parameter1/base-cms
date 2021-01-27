const { MongoDB, EJSON } = require('@parameter1/base-cms-db');
const newrelic = require('../newrelic');
const redis = require('../redis');
const SiteContext = require('./index');

const { ObjectID } = MongoDB;

module.exports = async ({
  basedb,
  siteId,
  tenant,
  enableCache,
}) => {
  if (!siteId) return new SiteContext();
  const cacheKey = `base_gql_site:${siteId}`;

  let hit = false;
  let site;

  // attempt to load site from cache.
  const serialized = enableCache ? await redis.get(cacheKey) : null;
  if (serialized) {
    hit = true;
    site = EJSON.parse(serialized);
  } else {
    const projection = {
      name: 1,
      host: 1,
      decription: 1,
      language: 1,
      imageHost: 1,
      assetHost: 1,
      date: 1,
    };
    site = await basedb.findOne('platform.Product', {
      status: 1,
      type: 'Site',
      _id: new ObjectID(siteId),
    }, { projection });
  }

  if (!site) throw new Error(`No site was found for tenant '${tenant}' using ID '${siteId}'`);
  if (!site.host) throw new Error(`No site host is set for tenant '${tenant}' using ID '${siteId}'`);

  // set the site object to cache, but do not await
  if (enableCache && !hit) redis.set(cacheKey, EJSON.stringify(site), 'EX', 600).catch(newrelic.noticeError.bind(newrelic));

  return new SiteContext(site);
};
