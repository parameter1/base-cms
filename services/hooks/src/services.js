const { filterDsn } = require('@parameter1/base-cms-db/utils');
const {
  caprica,
  leonis,
  tauron,
  virgon,
} = require('./basedb')('test');
const { log } = require('./output');

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
    start('BaseDB Caprica', caprica.client.connect(), filterDsn),
    start('BaseDB Leonis', leonis.client.connect(), filterDsn),
    start('BaseDB Tauron', tauron.client.connect(), filterDsn),
    start('BaseDB Virgon', virgon.client.connect(), filterDsn),
  ]),
  stop: () => Promise.all([
    stop('BaseDB Caprica', caprica.client.close()),
    stop('BaseDB Leonis', leonis.client.close()),
    stop('BaseDB Tauron', tauron.client.close()),
    stop('BaseDB Virgon', virgon.client.close()),
  ]),
  ping: () => Promise.all([
    ping('BaseDB Caprica', caprica.client.command({ ping: 1 })),
    ping('BaseDB Leonis', leonis.client.command({ ping: 1 })),
    ping('BaseDB Tauron', tauron.client.command({ ping: 1 })),
    ping('BaseDB Virgon', virgon.client.command({ ping: 1 })),
  ]),
};
