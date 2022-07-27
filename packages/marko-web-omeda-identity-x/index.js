const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');
const omeda = require('@parameter1/base-cms-marko-web-omeda');
const identityX = require('@parameter1/base-cms-marko-web-identity-x');
const addOmedaHooksToIdentityXConfig = require('./add-integration-hooks');
const setPromoSourceCookie = require('./middleware/set-promo-source');
const stripOlyticsParam = require('./middleware/strip-olytics-param');
const resyncCustomerData = require('./middleware/resync-customer-data');
const setOlyticsCookie = require('./middleware/set-olytics-cookie');
const rapidIdentify = require('./middleware/rapid-identify');
const rapidIdentifyRouter = require('./routes/rapid-identify');
const props = require('./validation/props');
const schemas = require('./validation/schemas');

module.exports = (app, params = {}) => {
  const {
    appendBehaviorToHook,
    appendDemographicToHook,
    appendPromoCodeToHook,
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
    appendBehaviorToHook: Joi.array().items(schemas.hookBehavior),
    appendDemographicToHook: Joi.array().items(schemas.hookDemographic),
    appendPromoCodeToHook: Joi.array().items(schemas.hookPromoCode),
    appId: Joi.string().required(),
    brandKey: props.brandKey.required(),
    clientKey: props.clientKey.required(),
    idxConfig: props.idxConfig.required(),
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
    appendBehaviorToHook,
    appendDemographicToHook,
    appendPromoCodeToHook,
    brandKey,
    idxConfig,
    idxOmedaRapidIdentifyProp,
    omedaGraphQLClientProp,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
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
