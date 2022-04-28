const gql = require('graphql-tag');

module.exports = gql`

fragment WhitePapersBlockFragment on Content {
  id
  type
  shortName
  teaser(input: { useFallback: false, maxLength: null })
  siteContext {
    path
  }
  company {
    id
    type
    name
    siteContext {
      path
    }
  }
  primarySection {
    id
    name
  }
}

`;
