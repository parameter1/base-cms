const createClient = require('@parameter1/base-cms-apollo-ssr');
const fragmentMatcher = require('@parameter1/base-cms-graphql-fragment-types/fragment-matcher');

module.exports = (uri, config, linkConfig, contextFn) => createClient({
  uri,
  config,
  linkConfig,
  contextFn,
  cacheConfig: { fragmentMatcher },
});
