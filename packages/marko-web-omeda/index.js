const { graphqlClient, rapidIdentify } = require('./middleware');

module.exports = (app, {
  brandKey,
  clientKey,
  appId,
  inputId,
  rapidIdentProductId,
  omedaGraphQLClientProp = '$omedaGraphQLClient',
  omedaRapidIdentifyProp = '$omedaRapidIdentify',
} = {}) => {
  app.use(graphqlClient({
    brandKey,
    clientKey,
    appId,
    inputId,
    prop: omedaGraphQLClientProp,
  }));
  app.use(rapidIdentify({
    productId: rapidIdentProductId,
    omedaGraphQLClientProp,
    prop: omedaRapidIdentifyProp,
  }));
};
