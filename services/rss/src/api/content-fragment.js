const gql = require('graphql-tag');

module.exports = gql`

fragment RSSItemContentFragment on Content {
  id
  seoTitle
  teaser(input: { useFallback: false, maxLength: null })
  siteContext {
    url
  }
  publishedDate(input: { format: "ddd, DD MMM YYYY HH:mm:ss ZZ" })
  primarySection {
    id
    alias
    name
    fullName
  }
  images(input:{ pagination: { limit: 100 }, sort: { order: values } }) {
    edges {
      node {
        id
        src(input: { options: { auto: "format,compress", q: 70 } })
      }
    }
  }
  ... on Authorable {
    authors {
      edges {
        node {
          id
          firstName
          lastName
          publicEmail
        }
      }
    }
  }
  ... on ContentVideo {
    embedSrc
  }
}

`;
