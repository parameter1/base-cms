const graphqlClient = require('./graphql-client');
const rapidIdentify = require('./rapid-identify');

module.exports = (app, {
  brandKey,
  clientKey,
  appId,
  inputId,

  rapidIdentProductId,
} = {}) => {
  app.use(graphqlClient({
    brandKey,
    clientKey,
    appId,
    inputId,
  }));
  app.use(rapidIdentify({ productId: rapidIdentProductId }));
};
