const gql = require('graphql-tag');

module.exports = gql`
  mutation DeleteAppUserForCurrentApplication($input: DeleteAppUserForCurrentApplicationInput!) {
    deleteAppUserForCurrentApplication(input: $input)
  }
`;
