const gql = require('graphql-tag');
const defaultFragment = require('../fragments/block-most-popular-content');
const { extractFragmentData } = require('../../utils');

/**
 * Builds the `BlockMostPopularContent` GraphQL operation.
 *
 * @param {object} params
 * @param {string} [params.queryFragment] The `graphql-tag` fragment
 *                                        to apply to `edges.node.content` on
 *                                        the `mostPopularContent` query.
 */
module.exports = ({ queryFragment, queryName = '' } = {}) => {
  const { spreadFragmentName, processedFragment } = extractFragmentData(queryFragment);
  return gql`
    query BlockMostPopularContent${queryName}($input: QueryMostPopularContentInput! = {}) {
      mostPopularContent(input: $input) {
        edges {
          node {
            id
            uniqueUsers
            views
            content {
              ...BlockMostPopularContentFragment
              ${spreadFragmentName}
            }
          }
        }
      }
    }
    ${defaultFragment}
    ${processedFragment}
  `;
};
