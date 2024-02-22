const { startServer } = require('@parameter1/base-cms-marko-newsletters');
const coreConfig = require('./config/core');
const customConfig = require('./config/custom');

const { log } = console;

module.exports = startServer({
  rootDir: __dirname,
  coreConfig,
  customConfig,
  onStart: (app) => app.set('trust proxy', 'loopback, linklocal, uniquelocal'),
  onAsyncBlockError: log,
}).then(() => log('Newsletters started!')).catch((e) => setImmediate(() => { throw e; }));
