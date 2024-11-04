const gql = require('graphql-tag');
const defaultFragment = require('../fragments/advertising-post-by-id');

module.exports = gql`
query advertisingPostByIdOrImportEntity($_id: ObjectID!, $provider: string, $tenant: string, $types: string) {
advertisingPostByIdOrImportEntity(_id: $_id, provider: $provider, teanant: $tenant, type: $types) {
  ...${defaultFragment}
}
}
`;
