const startServer = require('@parameter1/base-cms-marko-web/start-server');

const document = require('./server/components/document');
const routes = require('./server/routes');
const siteConfig = require('./config/site');
const coreConfig = require('./config/core');

const { log } = console;

module.exports = startServer({
  rootDir: __dirname,
  coreConfig,
  siteConfig,
  routes,
  document,
}).then(() => log('Website started!')).catch(e => setImmediate(() => { throw e; }));
