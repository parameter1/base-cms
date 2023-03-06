const redis = require('../redis');
const { cacheKey } = require('./utils');
const { USE_CACHE_LOADERS } = require('../env');

/**
 * @typedef {import("@parameter1/base-cms-db/src/basedb.js")} BaseDB
 */

/**
 * @param {object} params
 * @param {BaseDB} params.basedb
 * @param {object} params.query
 * @param {boolean} params.strict
 */
const loadFromDb = ({ basedb, query, strict }) => {
  const type = 'website.Section';
  const projection = { _id: 1 };
  if (strict) {
    return basedb.strictFindOne(type, query, { projection });
  }
  return basedb.findOne(type, query, { projection });
};

const { log } = console;

/**
 *
 * @param {object} params
 * @param {BaseDB} params.basedb
 * @param {Function} [params.onCacheError]
 * @param {number} [params.refreshMaxAge=3600]
 * @param {boolean} [params.debug]
 */
module.exports = ({
  basedb,
  onCacheError,
  refreshMaxAge = 3600, // every hour, do a background refresh of the data
  debug = process.env.NODE_ENV === 'development',
}) => {
  const { tenant } = basedb;
  return async ({
    siteId,
    id,
    alias,
    strict = true,
  }) => {
    if (!id && !alias) return null;

    const keyParts = [];
    if (siteId) keyParts.push(`site-${siteId}`);

    const query = {
      status: 1,
      ...(siteId && { 'site.$id': siteId }),
    };
    if (alias) {
      keyParts.push(`alias-${alias}`);
      query.alias = alias;
    } else {
      keyParts.push(`id-${id}`);
      query._id = id;
    }

    const getFromCache = async (key) => {
      if (!USE_CACHE_LOADERS) return null;
      return redis.get(key);
    };

    const loadAndSet = async (key) => {
      const now = Date.now();
      const data = await loadFromDb({ basedb, query, strict });
      if (USE_CACHE_LOADERS) {
        redis.set(key, JSON.stringify({ data, ts: now }), 'EX', 60 * 60 * 24 * 365).catch((e) => {
          if (typeof onCacheError === 'function') onCacheError(e);
        });
      }
      return data;
    };

    const key = cacheKey({ tenant, loaderType: 'section', parts: keyParts });
    const response = await getFromCache(key);
    if (response) {
      // return the obj, then check the age and do a hit for pass
      const { data, ts } = JSON.parse(response);
      // age, in seconds
      const age = Math.floor((Date.now() - ts) / 1000);
      const stale = age > refreshMaxAge;
      // when stale, refresh _in the background_
      if (stale) {
        loadAndSet(key).catch((e) => {
          if (typeof onCacheError === 'function') onCacheError(e);
        });
      }
      if (debug) log('section loader cache hit', { data, age, stale });
      return data;
    }

    const data = await loadAndSet(key);
    return data;
  };
};
