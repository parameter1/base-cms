const gql = require('graphql-tag');
const imageFragment = require('./image');

module.exports = gql`
  fragment DefaultStoryFragment on Story {
    id
    title
    teaser
    body
    primaryImage {
      ...ImageFragment
    }
  }
  ${imageFragment}
`;
