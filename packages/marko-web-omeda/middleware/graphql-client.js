const createClient = require('@parameter1/omeda-graphql-client');

module.exports = ({
  uri = 'https://graphql.omeda.parameter1.com/',
  brandKey,
  clientKey,
  appId,
  inputId,

  config = {},
  linkConfig = {},
  prop = '$omedaGraphQLClient',
} = {}) => {
  if (!uri) throw new Error('The Omeda GraphQL `uri` is required.');
  if (!brandKey) throw new Error('The Omeda `brandKey` is required.');
  if (!appId) throw new Error('The Omeda `appId` is required.');
  if (!prop) throw new Error('The middleware request property is required.');
  return (req, res, next) => {
    const client = createClient({
      uri,
      brandKey,
      clientKey,
      appId,
      inputId,
      config,
      linkConfig,
    });
    req[prop] = client;
    res.locals[prop] = client;
    next();
  };
};
