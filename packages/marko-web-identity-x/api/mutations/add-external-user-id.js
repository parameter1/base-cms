const gql = require('graphql-tag');
const userFragment = require('../fragments/active-user');

module.exports = gql`

mutation AddExternalUserId($input: SetAppUserExternalIdMutationInput!) {
  addAppUserExternalId(input: $input) {
    ...ActiveUserFragment
  }

  ${userFragment}
}

`;
