const fetch = require('node-fetch');
const { ApolloClient } = require('apollo-client');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { createHttpLink } = require('apollo-link-http');
const { setContext } = require('apollo-link-context');

const rootConfig = {
  connectToDevTools: false,
  ssrMode: true,
};

module.exports = ({
  uri,
  headers,
  contextFn,
  config,
  cacheConfig,
  linkConfig,
} = {}) => {
  if (!uri) throw new Error('A GraphQL API URI must be provided.');

  const contextLink = setContext((ctx) => {
    if (typeof contextFn === 'function') return contextFn(ctx);
    return undefined;
  });
  const httpLink = createHttpLink({
    ...linkConfig,
    fetch,
    uri,
    headers: {
      ...headers,
      ...(linkConfig && linkConfig.headers),
    },
  });

  return new ApolloClient({
    ...config,
    ...rootConfig,
    link: contextLink.concat(httpLink),
    cache: new InMemoryCache(cacheConfig),
  });
};
