const { filterDsn } = require('@parameter1/base-cms-db/utils');
const basedb = require('./basedb')('test');
const redis = require('./redis');
const gqlOpLogger = require('./graphql/operation-logger');
const { log } = require('./output');
const pkg = require('../package.json');

const redisConnect = new Promise((resolve, reject) => {
  redis.on('connect', resolve);
  redis.on('error', reject);
});

const pingWriteArgs = [{ _id: pkg.name }, { $set: { last: new Date() } }, { upsert: true }];

const start = (name, promise, url) => {
  log(`> Connecting to ${name}...`);
  return promise.then((r) => {
    const u = typeof url === 'function' ? url(r) : url;
    log(`> ${name} connected ${u ? `(${u})` : ''}`);
    return r;
  });
};

const stop = (name, promise) => {
  log(`> Disconnecting from ${name}...`);
  return promise.then((r) => {
    log(`> ${name} disconnected`);
    return r;
  });
};

const ping = (name, promise) => promise.then(() => `${name} pinged successfully.`);

module.exports = {
  start: () => Promise.all([
    start('BaseDB', basedb.client.connect(), filterDsn),
    start('Redis', redisConnect),
    gqlOpLogger.enabled ? start('GraphQL Request Logger', gqlOpLogger.connect()) : Promise.resolve(),
  ]),
  stop: () => Promise.all([
    stop('BaseDB', basedb.client.close()),
    stop('Redis', redis.quit()),
    gqlOpLogger.enabled ? start('GraphQL Request Logger', gqlOpLogger.close()) : Promise.resolve(),
  ]),
  ping: async () => {
    const collection = await basedb.client.collection('platform', 'pings');
    return Promise.all([
      ping('BaseDB', basedb.client.command({ ping: 1 })),
      ping('BaseDB write', collection.updateOne(...pingWriteArgs)),
      ping('Redis', redis.ping()),
    ]);
  },
};
