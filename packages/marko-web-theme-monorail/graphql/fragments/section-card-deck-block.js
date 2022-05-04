const gql = require('graphql-tag');

module.exports = gql`

fragment SectionCardDeckBlockContentFragment on Content {
  id
  type
  shortName
  siteContext {
    path
  }
  primaryImage {
    id
    src(input: { options: { auto: "format,compress" } })
    alt
    isLogo
  }
}

`;
