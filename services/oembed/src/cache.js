const { createHash } = require('crypto');
const redis = require('./redis');

const createCacheKey = ({ url, params } = {}) => {
  const hash = createHash('sha256').update(JSON.stringify({ url, params })).digest('hex');
  return `base_oembed:${hash}`;
};

const getFor = async ({ url, params } = {}) => {
  const key = createCacheKey({ url, params });
  const serialized = await redis.get(key);
  if (!serialized) return null;
  const cacheValue = JSON.parse(serialized);
  const age = Math.round((Date.now() - cacheValue.cacheTime) / 1000);
  return { ...cacheValue, age };
};

const setFor = async ({ url, params, data } = {}) => {
  const key = createCacheKey({ url, params });
  const cacheValue = { data, cacheTime: Date.now() };
  const ttl = 60 * 60 * 24 * 3; // cache for 72 hours
  await redis.set(key, JSON.stringify(cacheValue), 'EX', ttl);
};

module.exports = {
  createCacheKey,
  getFor,
  setFor,
};
