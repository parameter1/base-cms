const gql = require('graphql-tag');

module.exports = gql`
  fragment NativeXImageFragment on Image {
    id
    src
    focalPoint {
      x
      y
    }
  }
`;
