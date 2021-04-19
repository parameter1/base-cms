const gql = require('graphql-tag');
const { extractFragmentData } = require('@parameter1/base-cms-web-common/utils');

const buildContentQuery = ({ fragment }) => {
  const { spreadFragmentName, processedFragment } = extractFragmentData(fragment);
  return gql`
    query WebsiteSearchPage(
      $ids: [Int!]!
      $limit: Int!
    ) {
      allContent(input: {
        ids: $ids,
        status: any,
        pagination: { limit: $limit }
      }) {
        edges {
          node {
            ${spreadFragmentName}
          }
        }
      }
    }

    ${processedFragment}
  `;
};

module.exports = { buildContentQuery };
