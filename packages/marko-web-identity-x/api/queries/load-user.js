const gql = require('graphql-tag');
const userFragment = require('../fragments/active-user');

module.exports = gql`
  query LoadUserByEmail($email: String!) {
    appUser(input: { email: $email }) {
      ...ActiveUserFragment
    }
  }
  ${userFragment}
`;
