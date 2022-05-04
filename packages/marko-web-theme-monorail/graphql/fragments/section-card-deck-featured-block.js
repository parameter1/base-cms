const gql = require('graphql-tag');

module.exports = gql`

fragment SectionCardDeckFeaturedBlockFragment on Content {
  id
  type
  shortName
  teaser(input: { useFallback: false, maxLength: null })
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
