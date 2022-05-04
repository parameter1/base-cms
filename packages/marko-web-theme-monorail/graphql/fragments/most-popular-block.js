const gql = require('graphql-tag');

module.exports = gql`

fragment MostPopularBlockFragment on Content {
  id
  type
  shortName
  labels
  siteContext {
    path
  }
  primarySection {
    id
    name
    fullName
    canonicalPath
  }
}

`;
