const gql = require('graphql-tag');

module.exports = gql`
fragment ContentMeterFragment on Content {
  id
  name
  labels
  siteContext {
    path
    canonicalUrl
  }
  primarySection {
    id
    alias
  }
}
`;
