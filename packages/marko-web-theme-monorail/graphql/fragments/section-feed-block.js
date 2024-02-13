const gql = require('graphql-tag');

module.exports = gql`

fragment SectionFeedBlockContentFragment on Content {
  id
  type
  shortName
  labels
  teaser(input: { useFallback: false, maxLength: null })
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
  company {
    id
    name
    canonicalPath
  }
  ... on ContentWebinar {
    linkUrl
    startDate
    transcript
    sponsors {
      edges {
        node {
          id
          name
          primaryImage {
            id
            src(input: { options: { auto: "format,compress" } })
            alt
            isLogo
          }
          siteContext {
            path
          }
        }
      }
    }
    speakers {
      edges {
        node {
          id
          name
          title
        }
      }
    }
  }
  ... on ContentEvent {
    startDate
    endDate
    website
  }
  ... on ContentCompany {
    address1
    address2
    cityStateZip
  }
  ... on Authorable {
    authors {
      edges {
        node {
          id
          name
          canonicalPath
        }
      }
    }
  }
}

`;
