const gql = require('graphql-tag');

module.exports = gql`

fragment MagazineCurrentIssueFragment on MagazineIssue {
  id
  name
  description
  digitalEditionUrl
  canonicalPath
  coverImage {
    id
    src(input: { options: { auto: "format,compress", q: 70 } })
  }
  publication {
    id
    name
    description
    subscribeUrl
    cancelUrl
    changeAddressUrl
    renewalUrl
    reprintsUrl
    einquiryUrl
    canonicalPath
  }
}

`;
