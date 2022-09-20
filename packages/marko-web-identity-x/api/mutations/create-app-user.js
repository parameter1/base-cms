const gql = require('graphql-tag');
const userFragment = require('../fragments/active-user');

module.exports = gql`
  mutation LoginCreateAppUser($email: String!) {
    createAppUser(input: { email: $email }) {
      ...ActiveUserFragment
    }
  }
  ${userFragment}
`;
