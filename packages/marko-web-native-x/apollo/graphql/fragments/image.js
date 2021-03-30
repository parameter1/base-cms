const gql = require('graphql-tag');

module.exports = gql`
  fragment ImageFragment on Image {
    id
    src
    focalPoint {
      x
      y
    }
  }
`;
