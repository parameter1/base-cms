const { startServer } = require('@parameter1/base-cms-marko-web');

const coreConfig = require('./config/core');
const siteConfig = require('./config/site');
const routes = require('./server/routes');

const { log } = console;

module.exports = startServer({
  rootDir: __dirname,
  coreConfig,
  siteConfig,
  routes,
  onStart: (app) => {
    app.set('trust proxy', 'loopback, linklocal, uniquelocal');
  },
}).then(() => log('Website started!')).catch(e => setImmediate(() => { throw e; }));
