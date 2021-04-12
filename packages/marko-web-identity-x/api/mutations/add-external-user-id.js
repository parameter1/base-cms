const gql = require('graphql-tag');

module.exports = gql`

mutation AddExternalUserId($input: SetAppUserExternalIdMutationInput!) {
  addAppUserExternalId(input: $input) {
    id
    email
    externalIds {
      id
      identifier {
        value
        type
      }
      namespace {
        provider
        tenant
        type
      }
    }
  }
}

`;
