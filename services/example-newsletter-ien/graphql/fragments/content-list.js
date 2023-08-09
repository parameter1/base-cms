const gql = require('graphql-tag');

module.exports = gql`

fragment NewsletterContentListFragment on Content {
  id
  type
  name(input: { mutation: Email })
  teaser(input: { mutation: Email, useFallback: false, maxLength: 100 })
  primaryImage {
    id
    src
    alt
  }
  published
  ... on ContentTextAd {
    body(input: { mutation: Email })
    linkText
  }
}

`;
