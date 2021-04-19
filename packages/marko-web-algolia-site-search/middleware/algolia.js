const algoliasearch = require('algoliasearch');

module.exports = ({
  prop = '$algolia',
} = {}) => (req, res, next) => {
  const { ALGOLIA_APP_ID, ALGOLIA_API_KEY, ALGOLIA_DEFAULT_INDEX } = process.env;

  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
  const algolia = { client, defaultIndex: client.initIndex(ALGOLIA_DEFAULT_INDEX) };
  req[prop] = algolia;
  res.locals[prop] = algolia;
  next();
};
