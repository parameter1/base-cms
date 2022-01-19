const { startServer } = require('@parameter1/base-cms-marko-web');
const omedaIdentityX = require('@parameter1/base-cms-marko-web-omeda-identity-x');
const { get, getAsObject } = require('@parameter1/base-cms-object-path');

const document = require('./server/components/document');
const coreConfig = require('./config/core');
const siteConfig = require('./config/site');
const routes = require('./server/routes');
const idxRouteTemplates = require('./server/templates/user');

const { log } = console;

module.exports = startServer({
  rootDir: __dirname,
  document,
  coreConfig,
  siteConfig,
  routes,
  onStart: (app) => {
    app.set('trust proxy', 'loopback, linklocal, uniquelocal');

    // Setup IdentityX + Omeda
    const omedaConfig = getAsObject(siteConfig, 'omeda');
    const idxConfig = getAsObject(siteConfig, 'identityX');
    omedaIdentityX(app, {
      brandKey: omedaConfig.brandKey,
      appId: omedaConfig.appId,
      inputId: omedaConfig.inputId,
      rapidIdentProductId: get(omedaConfig, 'rapidIdentification.productId'),
      idxConfig,
      idxRouteTemplates,
    });
  },
}).then(() => log('Website started!')).catch(e => setImmediate(() => { throw e; }));
