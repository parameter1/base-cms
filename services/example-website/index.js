const { startServer } = require('@parameter1/base-cms-marko-web');
const omedaIdentityX = require('@parameter1/base-cms-marko-web-omeda-identity-x');
const { set, get, getAsObject } = require('@parameter1/base-cms-object-path');
const contactUs = require('@parameter1/base-cms-marko-web-contact-us');
const omedaNewsletters = require('@parameter1/base-cms-marko-web-omeda/routes/omeda-newsletters');
const loadInquiry = require('@parameter1/base-cms-marko-web-inquiry');
const document = require('./server/components/document');
const coreConfig = require('./config/core');
const siteConfig = require('./config/site');
const siteRoutes = require('./server/routes');
const idxRouteTemplates = require('./server/templates/user');
const recaptcha = require('./config/recaptcha');

const { log } = console;

const routes = config => (app) => {
  // Handle submissions on /__inquiry
  loadInquiry(app);
  // Handle Omeda Newsletter Sign Ups
  omedaNewsletters(app);
  // Shared/global routes (all sites)
  contactUs(app, config);
  // Load site routes
  siteRoutes(app);
};

module.exports = startServer({
  rootDir: __dirname,
  document,
  coreConfig,
  siteConfig,
  routes: routes(siteConfig),
  onStart: (app) => {
    app.set('trust proxy', 'loopback, linklocal, uniquelocal');
    set(app.locals, 'recaptcha', recaptcha);

    // Setup IdentityX + Omeda
    const omedaConfig = getAsObject(siteConfig, 'omeda');
    const idxConfig = getAsObject(siteConfig, 'identityX');
    omedaIdentityX(app, {
      clientKey: omedaConfig.clientKey,
      brandKey: omedaConfig.brandKey,
      appId: omedaConfig.appId,
      inputId: omedaConfig.inputId,
      rapidIdentProductId: get(omedaConfig, 'rapidIdentification.productId'),
      idxConfig,
      idxRouteTemplates,
    });
  },
}).then(() => log('Website started!')).catch(e => setImmediate(() => { throw e; }));
