const gql = require('graphql-tag');

module.exports = gql`

fragment MagazinePublicationCardLatestIssueFragment on MagazineIssue {
  id
  name
  digitalEditionUrl
  canonicalPath
  fileSrc
  coverImage {
    id
    src
  }
  publication {
    id
    name
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
