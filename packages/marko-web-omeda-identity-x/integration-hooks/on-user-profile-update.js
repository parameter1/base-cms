const rapidIdentify = require('../rapid-identify');

module.exports = async ({
  brandKey,
  productId,
  omedaGraphQLProp = '$omeda',

  user,
  service,
  req,
}) => {
  const omedaGraphQL = req[omedaGraphQLProp];
  if (!omedaGraphQL) throw new Error(`Unable to load the Omeda GraphQL API from the request using prop ${omedaGraphQLProp}`);
  return rapidIdentify({
    brandKey,
    productId,
    appUser: user,
    identityX: service,
    omedaGraphQL,
  });
};
