const gql = require('graphql-tag');

module.exports = gql`

fragment TopStoriesBlockFragment on Content {
  id
  type
  shortName
  labels
  teaser(input: { useFallback: false, maxLength: null })
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
  ... on ContentWebinar {
    externalContentUrl: linkUrl
  }
  ... on ContentEvent {
    externalContentUrl: website
  }
}

`;
