const gql = require('graphql-tag');

module.exports = gql`

fragment MagazineIssuePageFragment on MagazineIssue {
  id
  name
  description
  digitalEditionUrl
  canonicalPath
  fileSrc
  coverImage {
    id
    src(input: { options: { auto: "format,compress", q: 70 } })
  }
  mailDate(input: { format: "x" })
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
