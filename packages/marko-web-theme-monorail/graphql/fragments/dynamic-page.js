const gql = require('graphql-tag');

module.exports = gql`
fragment DynamicPageFragment on ContentPage {
  id
  type
  name
  body
  primarySection {
    id
    name
    alias
  }
}
`;
