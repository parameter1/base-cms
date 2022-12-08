const { startServer } = require('@parameter1/base-cms-marko-web');
const omedaIdentityX = require('@parameter1/base-cms-marko-web-omeda-identity-x');
const auth0IdentityX = require('@parameter1/base-cms-marko-web-auth0-identity-x');
const basicIdentityX = require('@parameter1/base-cms-marko-web-identity-x');
const { set, getAsObject } = require('@parameter1/base-cms-object-path');
const contactUs = require('@parameter1/base-cms-marko-web-contact-us');
const omedaNewsletters = require('@parameter1/base-cms-marko-web-omeda/routes/omeda-newsletters');
const newsletterState = require('@parameter1/base-cms-marko-web-theme-monorail/middleware/newsletter-state');
const contentGating = require('@parameter1/base-cms-marko-web-theme-monorail/middleware/content-gating');
const i18n = require('@parameter1/base-cms-marko-web-theme-monorail/middleware/i18n');
const loadInquiry = require('@parameter1/base-cms-marko-web-inquiry');
const document = require('./server/components/document');
const coreConfig = require('./config/core');
const siteConfig = require('./config/site');
const idxConfig = require('./config/identity-x');
const siteRoutes = require('./server/routes');
const idxRouteTemplates = require('./server/templates/user');
const recaptcha = require('./config/recaptcha');

const { log } = console;
const useAuth0 = Boolean(process.env.AUTH0_ENABLED === '1');
const useOmeda = Boolean(process.env.OMEDA_ENABLED === '1');

const routes = config => (app) => {
  // Handle submissions on /__inquiry
  loadInquiry(app);
  // Handle Omeda Newsletter Sign Ups
  omedaNewsletters(app);
  // Shared/global routes (all sites)
  contactUs(app, config);
  // Load site routes
  siteRoutes(app, config);
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

    // Monorail middleware
    i18n(app);
    contentGating(app);
    app.use(newsletterState());

    // Setup NativeX.
    const nativeXConfig = getAsObject(siteConfig, 'nativeX');
    set(app.locals, 'nativeX', nativeXConfig);

    if (useAuth0) {
      // Setup IdentityX + Auth0
      const config = getAsObject(siteConfig, 'auth0');
      auth0IdentityX(app, { ...config, idxConfig, idxRouteTemplates });
      log('Enabled IdentityX + Auth0');
    } else if (useOmeda) {
      // Setup IdentityX + Omeda
      const oidxConfig = getAsObject(siteConfig, 'omedaIdentityX');
      omedaIdentityX(app, { ...oidxConfig, idxRouteTemplates });
      log('Enabled IdentityX + Omeda');
    } else {
      basicIdentityX(app, idxConfig, { templates: idxRouteTemplates });
      log('Enabled IdentityX');
    }

    idxConfig.addHook({
      name: 'onChangeEmailSuccess',
      shouldAwait: true,
      fn: async ({ user, oldEmail }) => {
        log(`User ${user.id} email was changed from ${oldEmail} to ${user.email}!`);
      },
    });
  },
}).then(() => log('Website started!')).catch(e => setImmediate(() => { throw e; }));
