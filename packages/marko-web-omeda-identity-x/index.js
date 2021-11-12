const omeda = require('@parameter1/base-cms-marko-web-omeda');
const identityX = require('@parameter1/base-cms-marko-web-identity-x');
const addOmedaHooksToConfig = require('./add-integration-hooks');
const stripOlyticsParam = require('./middleware/strip-olytics-param');
const rapidIdentify = require('./middleware/rapid-identify');

module.exports = (app, {
  brandKey,
  clientKey,
  appId,
  inputId,

  rapidIdentProductId,
  omedaGraphQLClientProp = '$omedaGraphQLClient',
  omedaRapidIdentifyProp = '$omedaRapidIdentify',

  idxConfig,
  idxOmedaRapidIdentifyProp = '$idxOmedaRapidIdentify',
} = {}) => {
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
  addOmedaHooksToConfig({
    idxConfig,
    brandKey,
    productId: rapidIdentProductId,
    omedaGraphQLProp: omedaGraphQLClientProp,
  });

  // install identity x
  identityX(app, idxConfig);

  // attach the identity-x rapid identification wrapper middleware
  app.use(rapidIdentify({
    brandKey,
    productId: rapidIdentProductId,
    prop: idxOmedaRapidIdentifyProp,
    omedaRapidIdentifyProp,
  }));

  // register the rapid identify AJAX route
  app.use('/__idx/omeda-rapid-ident', rapidIdentify({
    brandKey,
    idxOmedaRapidIdentifyProp,
  }));

  // strip `oly_enc_id` when identity-x user is logged-in
  app.use(stripOlyticsParam());
};
