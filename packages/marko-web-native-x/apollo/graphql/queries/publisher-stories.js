const { extractFragmentData } = require('@parameter1/base-cms-web-common/utils');
const gql = require('graphql-tag');

module.exports = (queryFragment) => {
  const { spreadFragmentName, processedFragment } = extractFragmentData(queryFragment);
  return gql`
    query MarkoWebPublisherStories($input: PublisherStoriesInput!) {
      publisherStories(input: $input) {
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
