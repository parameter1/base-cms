const gql = require('graphql-tag');
const userFragment = require('../fragments/active-user');

module.exports = gql`
  query LoadUserById($id: String!) {
    appUserById(input: { id: $id }) {
      ...ActiveUserFragment
    }
  }
  ${userFragment}
`;
