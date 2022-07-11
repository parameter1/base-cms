const omeda = require('@parameter1/base-cms-marko-web-omeda');
const identityX = require('@parameter1/base-cms-marko-web-identity-x');
const addOmedaHooksToIdentityXConfig = require('./add-integration-hooks');
const setPromoSourceCookie = require('./middleware/set-promo-source');
const stripOlyticsParam = require('./middleware/strip-olytics-param');
const resyncCustomerData = require('./middleware/resync-customer-data');
const setOlyticsCookie = require('./middleware/set-olytics-cookie');
const rapidIdentify = require('./middleware/rapid-identify');
const rapidIdentifyRouter = require('./routes/rapid-identify');
const OmedaIdentityXConfiguration = require('./config');

const { warn } = console;

module.exports = (app, maybeCfg, idxRouteTemplates) => {
  this.config = maybeCfg;
  if (!(maybeCfg instanceof OmedaIdentityXConfiguration)) {
    warn('Deprecated -- update call to oidx middleware to use configuration class instance!');
    this.config = new OmedaIdentityXConfiguration({
      omedaConfig: {
        brandKey: maybeCfg.brandKey,
        clientKey: maybeCfg.clientKey,
        appId: maybeCfg.appId,
        inputId: maybeCfg.inputId,
        rapidIdentification: { productId: maybeCfg.rapidIdentProductId },
      },
      idxConfig: maybeCfg.idxConfig,
      omedaGraphQLClientProp: maybeCfg.omedaGraphQLClientProp || '$omedaGraphQLClient',
      omedaRapidIdentifyProp: maybeCfg.omedaRapidIdentifyProp || '$omedaRapidIdentify',
      omedaPromoCodeCookieName: maybeCfg.omedaPromoCodeCookieName || 'omeda_promo_code',
      idxOmedaRapidIdentifyProp: maybeCfg.idxOmedaRapidIdentifyProp || '$idxOmedaRapidIdentify',
      omedaPromoCodeDefault: maybeCfg.omedaPromoCodeDefault,
      ...maybeCfg,
    });
  }

  if (!this.config.getBrandKey()) throw new Error('The Omeda `brandKey` is required.');
  if (!this.config.get('omedaConfig.appId')) throw new Error('The Omeda `appId` is required.');
  if (!this.config.get('omedaConfig.rapidIdentification.productId')) throw new Error('The Omeda `rapidIdentification.productId` is required.');

  // consistently pass brand key
  const brandKey = this.config.getBrandKey();

  // strip `oly_enc_id` when identity-x user is logged-in
  app.use(stripOlyticsParam());

  // set `omeda_promo_code` when the URL parameter is present
  app.use(setPromoSourceCookie({
    omedaPromoCodeCookieName: this.config.get('omedaPromoCodeCookieName'),
  }));

  // install omeda middleware
  omeda(app, {
    brandKey,
    clientKey: this.config.get('omedaConfig.clientKey'),
    appId: this.config.get('omedaConfig.appId'),
    inputId: this.config.get('omedaConfig.inputId'),
    rapidIdentProductId: this.config.get('omedaConfig.rapidIdentification.productId'),
    omedaGraphQLClientProp: this.config.get('omedaGraphQLClientProp'),
    omedaRapidIdentifyProp: this.config.get('omedaRapidIdentifyProp'),
  });

  // add appropiate identity-x to omeda integration hooks
  addOmedaHooksToIdentityXConfig(this.config);

  // attach the identity-x rapid identification wrapper middleware
  app.use(rapidIdentify({
    brandKey,
    rapidIdentProductId: this.config.get('omedaConfig.rapidIdentification.productId'),
    prop: this.config.get('idxOmedaRapidIdentifyProp'),
    omedaRapidIdentifyProp: this.config.get('omedaRapidIdentifyProp'),
    omedaPromoCodeCookieName: this.config.get('omedaPromoCodeCookieName'),
    omedaPromoCodeDefault: this.config.get('omedaPromoCodeDefault'),
  }));

  // install identity x
  const templates = idxRouteTemplates || maybeCfg.idxRouteTemplates;
  identityX(app, this.config.get('idxConfig'), { templates });

  app.use(setOlyticsCookie({ brandKey }));

  // install the Omeda data sync middleware
  app.use(resyncCustomerData({
    brandKey,
    omedaGraphQLClientProp: this.config.get('omedaGraphQLClientProp'),
  }));

  // register the rapid identify AJAX route
  app.use('/__idx/omeda-rapid-ident', rapidIdentifyRouter({
    brandKey: this.config.getBrandKey(),
    idxOmedaRapidIdentifyProp: this.config.get('idxOmedaRapidIdentifyProp'),
    omedaPromoCodeCookieName: this.config.get('omedaPromoCodeCookieName'),
    omedaPromoCodeDefault: this.config.get('omedaPromoCodeDefault'),
  }));
};
