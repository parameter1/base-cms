const buildQuery = require('../gql/query-factories/block-website-scheduled-content');

const date = (v) => (v instanceof Date ? v.valueOf() : v);

/**
 * @param {ApolloClient} apolloClient The Apollo GraphQL client that will perform the query.
 * @param {object} params
 * @param {number} [params.sectionId] The section ID.
 * @param {number} [params.sectionAlias] The section alias.
 * @param {date} params.beginningAfter The date to include content by
 * @param {date} params.beginningBefore The date to include content by
 * @param {date} params.endingAfter The date to include content by
 * @param {date} params.endingBefore The date to include content by
 * @param {number} [params.limit] The number of results to return.
 * @param {string} [params.after] The cursor to start returning results from.
 * @param {object} [params.sort] The sort parameters (field and order) to apply to the query.
 * @param {number} [params.optionId] The option ID.
 * @param {string} [params.optionName] The option name.
 * @param {number[]} [params.excludeContentIds] An array of content IDs to exclude.
 * @param {string[]} [params.excludeContentTypes] An array of content types to exclude.
 * @param {string[]} [params.includeContentIds] An array of the content IDs to include.
 * @param {string[]} [params.includeContentTypes] An array of content types to include.
 * @param {string[]} [params.includeLabels] An array of content labels to include.
 * @param {string[]} [params.excludeLabels] An array of content labels to exclude.
 * @param {boolean} [params.requiresImage] Whether the content must have an image.
 * @param {boolean} [params.sectionBubbling] Whether automatic section bubbling is applied.
 * @param {string} [params.queryFragment] The `graphql-tag` fragment
 *                                        to apply to the `websiteScheduledContent` query.
 * @param {string} [params.sectionFragment] The `graphql-tag` fragment
 *                                          to apply to the `websiteScheduledContent` section field.
 */
module.exports = async (apolloClient, {
  limit,
  skip,
  after,
  sort,

  siteId,
  sectionId,
  sectionAlias,
  optionId,
  optionName,
  beginningAfter,
  beginningBefore,
  endingAfter,
  endingBefore,

  excludeContentIds,
  excludeContentTypes,
  includeContentIds,
  includeContentTypes,

  includeLabels,
  excludeLabels,

  requiresImage,
  sectionBubbling,

  queryFragment,
  queryName,
  sectionFragment,
} = {}) => {
  const pagination = { limit, skip, after };
  const input = {
    pagination,
    excludeContentIds,
    excludeContentTypes,
    includeContentIds,
    includeContentTypes,
    includeLabels,
    excludeLabels,
    requiresImage,
    sectionAlias,
    sectionBubbling,
    siteId,
    sectionId,
    optionId,
    optionName,
    beginning: { after: date(beginningAfter), before: date(beginningBefore) },
    ending: { after: date(endingAfter), before: date(endingBefore) },
    ...(sort && { sort }),
  };
  const query = buildQuery({ queryFragment, queryName, sectionFragment });
  const variables = { input };

  const { data } = await apolloClient.query({ query, variables });
  if (!data || !data.websiteScheduledContent) return { nodes: [], pageInfo: {} };
  const { pageInfo, section } = data.websiteScheduledContent;
  const nodes = data.websiteScheduledContent.edges
    .map((edge) => (edge && edge.node ? edge.node : null))
    .filter((c) => c);
  return { nodes, pageInfo, section };
};
