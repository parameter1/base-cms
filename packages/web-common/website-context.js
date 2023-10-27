const gql = require('graphql-tag');
const siteFragment = require('./graphql/website-context-fragment');

const { error } = console;
const query = gql`

query MarkoWebsiteContext {
  websiteContext {
    ...MarkoWebsiteContextFragment
  }
}

${siteFragment}

`;

/**
 * @param {ApolloClient} apolloClient The BaseCMS Apollo GraphQL client that will perform the query.
 */
module.exports = async (apolloClient) => {
  try {
    const { data } = await apolloClient.query({ query });
    return data.websiteContext;
  } catch (e) {
    error(e);
    throw e;
  }
};
