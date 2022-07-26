const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');
const IdXConfig = require('@parameter1/base-cms-marko-web-identity-x/config');
const omeda = require('@parameter1/base-cms-marko-web-omeda');
const identityX = require('@parameter1/base-cms-marko-web-identity-x');
const addOmedaHooksToIdentityXConfig = require('./add-integration-hooks');
const setPromoSourceCookie = require('./middleware/set-promo-source');
const stripOlyticsParam = require('./middleware/strip-olytics-param');
const resyncCustomerData = require('./middleware/resync-customer-data');
const setOlyticsCookie = require('./middleware/set-olytics-cookie');
const rapidIdentify = require('./middleware/rapid-identify');
const rapidIdentifyRouter = require('./routes/rapid-identify');

module.exports = (app, params = {}) => {
  const validHooks = Object.keys(params.idxConfig.hooks);
  const {
    appId,
    brandKey,
    clientKey,
    idxConfig,
    idxOmedaRapidIdentifyProp,
    idxRouteTemplates,
    inputId,
    omedaGraphQLClientProp,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
    omedaRapidIdentifyProp,
    rapidIdentProductId,
  } = validate(Joi.object({
    appId: Joi.string().required(),
    brandKey: Joi.string().required().trim().lowercase(),
    clientKey: Joi.string().required().trim().lowercase(),
    idxConfig: Joi.object().required().instance(IdXConfig),
    idxOmedaRapidIdentifyProp: Joi.string().default('$idxOmedaRapidIdentify'),
    idxRouteTemplates: Joi.object().required(),
    inputId: Joi.string().required(),
    omedaGraphQLClientProp: Joi.string().default('$omedaGraphQLClient'),
    omedaPromoCodeCookieName: Joi.string().default('omeda_promo_code'),
    omedaPromoCodeDefault: Joi.string(),
    omedaRapidIdentifyProp: Joi.string().default('$omedaRapidIdentify'),
    rapidIdentProductId: Joi.number().required(),
  }), params);

  // strip `oly_enc_id` when identity-x user is logged-in
  app.use(stripOlyticsParam());

  // set `omeda_promo_code` when the URL parameter is present
  app.use(setPromoSourceCookie({
    omedaPromoCodeCookieName,
  }));

  // install omeda middleware
  omeda(app, {
    brandKey,
    clientKey,
    appId,
    inputId,
    rapidIdentProductId,
    omedaGraphQLClientProp,
    omedaRapidIdentifyProp,
  });

  // add appropiate identity-x to omeda integration hooks
  addOmedaHooksToIdentityXConfig({
    idxConfig,
    brandKey,
    productId: rapidIdentProductId,
    omedaGraphQLProp: omedaGraphQLClientProp,
  });

  // attach the identity-x rapid identification wrapper middleware
  app.use(rapidIdentify({
    brandKey,
    productId: rapidIdentProductId,
    prop: idxOmedaRapidIdentifyProp,
    omedaRapidIdentifyProp,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
  }));

  // install identity x
  identityX(app, idxConfig, { templates: idxRouteTemplates });

  app.use(setOlyticsCookie({ brandKey }));

  // install the Omeda data sync middleware
  app.use(resyncCustomerData({
    brandKey,
    omedaGraphQLClientProp,
  }));

  // register the rapid identify AJAX route
  app.use('/__idx/omeda-rapid-ident', rapidIdentifyRouter({
    brandKey,
    idxOmedaRapidIdentifyProp,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
  }));
};
