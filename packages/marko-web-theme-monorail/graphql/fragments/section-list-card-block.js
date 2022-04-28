const gql = require('graphql-tag');

module.exports = gql`

fragment SectionListCardBlockContentFragment on Content {
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
  primaryImage {
    id
    src(input: { options: { auto: "format,compress" } })
    alt
    isLogo
  }
}

`;
