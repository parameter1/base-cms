const gql = require('graphql-tag');

module.exports = gql`

fragment SectionBodyFeedBlockContentFragment on Content {
  id
  type
  shortName
  labels
  teaser(input: { useFallback: false, maxLength: null })
  body
  siteContext {
    path
  }
  published
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
