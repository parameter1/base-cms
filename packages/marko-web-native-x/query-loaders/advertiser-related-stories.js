const createClient = require('../apollo/create-client');
const defaultFragment = require('../apollo/graphql/fragments/related-stories');
const buildQuery = require('../apollo/graphql/queries/related-stories');
const convertStoryToContent = require('../utils/convert-story-to-content');
/**
 * @param NativeXConfiguration The NativeX config
 * @param object The Marko template to render
 * @param Document A query fragment to be used with the story query
 */
module.exports = async ({
  config,
  advertiserId,
  publisherId,
  excludeStoryIds,
  pagination,
  queryFragment = defaultFragment,
} = {}) => {
  const client = createClient(config.getGraphQLUri());
  const { data } = await client.query({
    query: buildQuery(queryFragment),
    variables: {
      input: { advertiserId, publisherId, excludeStoryIds },
      ...(pagination && { pagination }),
    },
  });
  if (!data || !data.advertiserStories) return { nodes: [], pageInfo: {} };
  const { pageInfo } = data.advertiserStories;
  const nodes = data.advertiserStories.edges
    .map(edge => (edge && edge.node ? convertStoryToContent(edge.node) : null))
    .filter(c => c);
  return { nodes, pageInfo };
};
