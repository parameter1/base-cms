const { extractFragmentData } = require('@parameter1/base-cms-web-common/utils');
const gql = require('graphql-tag');

module.exports = (queryFragment) => {
  const { spreadFragmentName, processedFragment } = extractFragmentData(queryFragment);
  return gql`
    query MarkoWebRelatedAdvertiserStories($input: AdvertiserStoriesInput!) {
      advertiserStories(input: $input) {
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
