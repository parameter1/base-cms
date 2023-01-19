const gql = require('graphql-tag');

module.exports = gql`
  fragment IdentityXAppUser on AppUser {
    id
    country { name }
    customAttributes
  }
`;
