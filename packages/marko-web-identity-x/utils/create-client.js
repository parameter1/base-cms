const fetch = require('node-fetch');
const { ApolloClient } = require('apollo-client');
const { InMemoryCache, IntrospectionFragmentMatcher } = require('apollo-cache-inmemory');
const { createHttpLink } = require('apollo-link-http');
const { setContext } = require('apollo-link-context');
const introspectionQueryResultData = require('../api/fragment-types.json');

const rootConfig = {
  connectToDevTools: false,
  ssrMode: true,
};

module.exports = ({
  req,
  token,
  appId,
  config,
  linkConfig = {},
} = {}) => {
  if (!appId) throw new Error('An IdentityX application ID is required.');

  const headers = {
    ...linkConfig.headers,
    'x-app-id': appId,
    'x-forwarded-for': req.ip,
    'user-agent': req.get('user-agent'),
  };
  if (token) headers.authorization = `AppUser ${token}`;

  const httpLink = createHttpLink({
    ...linkConfig,
    uri: process.env.IDENTITYX_GRAPHQL_URI || 'https://identity-x.parameter1.com/graphql',
    fetch,
    headers,
  });
  const contextLink = setContext((_, { apiToken }) => ({
    headers: { ...(apiToken && { authorization: `OrgUserApiToken ${apiToken}` }) },
  }));

  return new ApolloClient({
    ...config,
    ...rootConfig,
    link: contextLink.concat(httpLink),
    cache: new InMemoryCache({
      fragmentMatcher: new IntrospectionFragmentMatcher({ introspectionQueryResultData }),
    }),
  });
};
