const Redis = require('ioredis');
const { REDIS_CACHE_DSN } = require('./env');

module.exports = new Redis(REDIS_CACHE_DSN);
