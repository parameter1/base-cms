const gql = require('graphql-tag');

module.exports = gql`
  mutation ImpersonateAppUser($input: ImpersonateAppUserMutationInput!) {
    impersonateAppUser(input: $input) {
      token {
        id
        value
      }
    }
  }
`;
