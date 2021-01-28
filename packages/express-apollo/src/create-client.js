const fetch = require('node-fetch');
const { ApolloClient } = require('apollo-client');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { createHttpLink } = require('apollo-link-http');
const { setContext } = require('apollo-link-context');
const fragmentMatcher = require('@parameter1/base-cms-graphql-fragment-types/fragment-matcher');

const rootConfig = {
  connectToDevTools: false,
  ssrMode: true,
};

module.exports = (uri, config, linkConfig, contextFn) => {
  const contextLink = setContext((ctx) => {
    if (typeof contextFn === 'function') return contextFn(ctx);
    return undefined;
  });
  const httpLink = createHttpLink({ fetch, ...linkConfig, uri });
  return new ApolloClient({
    ...config,
    ...rootConfig,
    link: contextLink.concat(httpLink),
    cache: new InMemoryCache({ fragmentMatcher }),
  });
};
