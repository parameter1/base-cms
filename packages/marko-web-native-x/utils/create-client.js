const fetch = require('node-fetch');
const { ApolloClient } = require('apollo-client');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { createHttpLink } = require('apollo-link-http');
const { name, version } = require('../package.json');

module.exports = uri => new ApolloClient({
  name,
  version,
  connectToDevTools: false,
  ssrMode: true,
  link: createHttpLink({ uri, fetch }),
  cache: new InMemoryCache(),
});
