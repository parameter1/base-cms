const buildQuery = require('../gql/query-factories/block-most-popular-content');

/**
 * @param {ApolloClient} apolloClient The Apollo GraphQL client that will perform the query.
 * @param {object} params
 * @param {number} [params.limit] The number of results to return.
 * @param {string} [params.queryFragment] The `graphql-tag` fragment
 *                                        to apply to the `mostPopularContent` query.
 */
module.exports = async (apolloClient, {
  limit,
  queryFragment,
  queryName,
} = {}) => {
  const input = { limit };
  const query = buildQuery({ queryFragment, queryName });
  const variables = { input };

  const { data } = await apolloClient.query({ query, variables });
  if (!data || !data.mostPopularContent) return { nodes: [] };
  const nodes = data.mostPopularContent.edges
    .map(edge => (edge && edge.node ? edge.node : null))
    .filter(c => c);
  return { nodes };
};
