const gql = require('graphql-tag');
const { extractFragmentData } = require('@parameter1/base-cms-web-common/utils');

const buildBaseCMSQuery = ({ queryFragment, opSuffix = '' } = {}) => {
  const { spreadFragmentName, processedFragment } = extractFragmentData(queryFragment);
  return gql`
    query MarkoWebSearchContentIdsFromBrowse${opSuffix}($ids: [Int!]!, $limit: Int!) {
      allContent(input: { ids: $ids, pagination: { limit: $limit } }) {
        edges {
          node {
            id
            ${spreadFragmentName}
          }
        }
      }
    }
    ${processedFragment}
  `;
};

const baseBrowseQuery = gql`
  query MarkoWebSearchSearchContentIds($input: BrowseContentQueryInput!) {
    searchContentIds(input: $input) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      ids
    }
  }
`;

/**
 * @param {object} clients
 * @param {ApolloClient} clients.apolloBaseCMS The BaseCMS client that will perform the query.
 * @param {ApolloClient} clients.apolloBaseBrowse The BaseBrowse client that will perform the query.
 * @param {object} params
 * @param {number} [params.limit]
 * @param {number} [params.skip]
 * @param {string} [params.searchQuery]
 * @param {string[]} [params.contentTypes]
 * @param {string[]} [params.siteIds]
 * @param {number[]} [params.sectionIds]
 * @param {string} [params.queryFragment] The `graphql-tag` fragment
 *                                        to apply to the `allContent` query.
 * @param {string} [params.opSuffix] A suffix to add to the GraphQL operation name.
 */
module.exports = async ({ apolloBaseCMS, apolloBaseBrowse } = {}, {
  limit,
  skip,

  searchQuery,
  contentTypes = [],
  siteIds = [],
  sectionIds = [],

  queryFragment,
  opSuffix,
} = {}) => {
  if (!apolloBaseCMS || !apolloBaseBrowse) throw new Error('Both the BaseCMS and Base Browse Apollo clients must be provided.');
  const input = {
    omitScheduledAndExpiredContent: true,
    statuses: ['PUBLISHED'],
    contentTypes,
    ...(searchQuery && { search: { query: searchQuery } }),
    ...((siteIds.length || sectionIds.length) && {
      assignedToWebsites: {
        ...(siteIds.length && { siteIds }),
        ...(sectionIds.length && { sectionIds }),
      },
    }),
    pagination: { limit, skip },
  };

  const { data: baseBrowseData } = await apolloBaseBrowse.query({
    query: baseBrowseQuery,
    variables: { input },
  });

  const { ids, pageInfo, totalCount } = baseBrowseData.searchContentIds;
  if (!ids.length) return { nodes: [], pageInfo, totalCount };

  const { data } = await apolloBaseCMS.query({
    query: buildBaseCMSQuery({ queryFragment, opSuffix }),
    variables: { ids, limit: ids.length },
  });
  const nodes = data.allContent.edges
    .map(edge => (edge && edge.node ? edge.node : null))
    .filter(c => c);
  return { nodes, pageInfo, totalCount };
};
