const gql = require('graphql-tag');
const userFragment = require('../fragments/active-user');

module.exports = gql`
  query LoadUserByExternalId(
    $identifier: AppUserExternalIdentifierInput!,
    $namespace: AppUserExternalNamespaceInput!
  ) {
    appUserByExternalId(input: { identifier: $identifier, namespace: $namespace }) {
      ...ActiveUserFragment
    }
  }
  ${userFragment}
`;
