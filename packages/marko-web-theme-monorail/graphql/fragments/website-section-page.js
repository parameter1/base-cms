const gql = require('graphql-tag');

module.exports = gql`
fragment WebsiteSectionPageFragment on WebsiteSection {
  id
  name
  alias
  fullName
  description
  hierarchy {
    id
    alias
    name
  }
}
`;
