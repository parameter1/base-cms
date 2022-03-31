const gql = require('graphql-tag');
const imageFragment = require('./image');

module.exports = gql`
  fragment DefaultRelatedStoryFragment on Story {
    id
    title
    teaser
    url
    publishedAt
    primaryImage {
      ...ImageFragment
    }
    advertiser {
      id
      name
    }
  }
  ${imageFragment}
`;
