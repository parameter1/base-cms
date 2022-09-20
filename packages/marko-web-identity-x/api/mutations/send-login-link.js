const gql = require('graphql-tag');

module.exports = gql`
  mutation LoginSendLoginLink($input: SendAppUserLoginLinkMutationInput!) {
    sendAppUserLoginLink(input: $input)
  }
`;
