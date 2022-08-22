const gql = require('graphql-tag');

module.exports = gql`
fragment WebsiteSectionHierarchyFragment on WebsiteSection {
  id
  alias
  name
  hierarchy {
    id
    name
    alias
    canonicalPath
  }
  children(input: { pagination: { limit: 0 } }) {
    edges {
      node {
        id
        alias
        name
      }
    }
  }
}

`;
