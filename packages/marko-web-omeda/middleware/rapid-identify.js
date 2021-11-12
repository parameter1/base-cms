const rapidIdentify = require('../rapid-identify');

module.exports = ({
  productId,
  prop = '$omedaRapidIdentify',
  omedaGraphQLClientProp = '$omedaGraphQLClient',
} = {}) => {
  if (!productId) throw new Error('No Omeda rapid identification product ID was provided.');
  return (req, res, next) => {
    const omedaGraphQLClient = req[omedaGraphQLClientProp];
    if (!omedaGraphQLClient) throw new Error(`Unable to find the Omeda GraphQL client on the request using ${omedaGraphQLClientProp}`);
    const handler = async (params = {}) => rapidIdentify(omedaGraphQLClient, {
      productId,
      ...params,
    });

    req[prop] = handler;
    res.locals[prop] = handler;
    next();
  };
};
