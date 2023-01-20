const gql = require('graphql-tag');
const userFragment = require('../fragments/active-user');

module.exports = gql`
mutation UpdateOwnAppUserCustomAttributes($input: UpdateOwnAppUserCustomAttributesMutationInput!) {
  updateOwnAppUserCustomAttributes(input: $input) {
    id
    customAttributes
    ...ActiveUserFragment
  }
}

${userFragment}

`;
