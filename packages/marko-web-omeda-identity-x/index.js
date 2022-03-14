const omeda = require('@parameter1/base-cms-marko-web-omeda');
const identityX = require('@parameter1/base-cms-marko-web-identity-x');
const addOmedaHooksToIdentityXConfig = require('./add-integration-hooks');
const setPromoSourceCookie = require('./middleware/set-promo-source');
const stripOlyticsParam = require('./middleware/strip-olytics-param');
const rapidIdentify = require('./middleware/rapid-identify');
const rapidIdentifyRouter = require('./routes/rapid-identify');

module.exports = (app, {
  brandKey: brand,
  clientKey,
  appId,
  inputId,

  rapidIdentProductId,
  omedaGraphQLClientProp = '$omedaGraphQLClient',
  omedaRapidIdentifyProp = '$omedaRapidIdentify',

  omedaPromoCodeCookieName = 'oly_promo_src',
  omedaPromoCodeStripQueryParam = true,
  omedaPromoCodeDefault,

  idxConfig,
  idxOmedaRapidIdentifyProp = '$idxOmedaRapidIdentify',
  idxRouteTemplates = {},
} = {}) => {
  if (!brand) throw new Error('The Omeda `brandKey` is required.');
  if (!appId) throw new Error('The Omeda `appId` is required.');
  if (!rapidIdentProductId) throw new Error('The Omeda `rapidIdentProductId` is required.');

  // consistently pass brand key
  const brandKey = brand.trim().toLowerCase();

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

  // register the rapid identify AJAX route
  app.use('/__idx/omeda-rapid-ident', rapidIdentifyRouter({
    brandKey,
    idxOmedaRapidIdentifyProp,
  }));

  // strip `oly_enc_id` when identity-x user is logged-in
  app.use(stripOlyticsParam());

  // set `oly_promo_src` when the URL parameter is present
  app.use(setPromoSourceCookie({
    omedaPromoCodeCookieName,
    omedaPromoCodeStripQueryParam,
  }));
};
