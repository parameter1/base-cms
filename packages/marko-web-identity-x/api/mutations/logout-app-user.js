const gql = require('graphql-tag');
const userFragment = require('../fragments/active-user');

module.exports = gql`
  mutation LogoutAppUser($input: LogoutAppUserWithDataMutationInput!) {
    logoutAppUserWithData(input: $input) {
      ...ActiveUserFragment
    }
  }
  ${userFragment}
`;
