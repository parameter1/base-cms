const gql = require('graphql-tag');

module.exports = gql`

fragment BlockMostPopularContentFragment on Content {
  id
  type
  siteContext {
    path
  }
}

`;
