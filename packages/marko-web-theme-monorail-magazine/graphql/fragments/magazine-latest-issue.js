const gql = require('graphql-tag');

module.exports = gql`

fragment MagazineCurrentIssueFragment on MagazineIssue {
  id
  name
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
    canonicalPath
  }
}

`;
