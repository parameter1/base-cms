const gql = require('graphql-tag');

module.exports = gql`
  mutation SendChangeEmailLink($input: SendOwnAppUserChangeEmailLinkMutationInput!) {
    sendOwnAppUserChangeEmailLink(input: $input)
  }
`;
