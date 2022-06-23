const gql = require('graphql-tag');

module.exports = gql`

fragment MagazineIssuePageFragment on MagazineIssue {
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
    subscribeUrl
    renewalUrl
    canonicalPath
  }
}

`;
