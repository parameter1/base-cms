const gql = require('graphql-tag');
const imageFragment = require('./native-x-image');

module.exports = gql`
  fragment NativeXStoryFragment on Story {
    id
    title
    teaser
    body
    publishedAt
    url
    primaryImage {
      ...NativeXImageFragment
    }
    publisher {
      id
    }
    advertiser {
      id
      name
      logo {
        ...NativeXImageFragment
      }
    }
  }
  ${imageFragment}
`;
