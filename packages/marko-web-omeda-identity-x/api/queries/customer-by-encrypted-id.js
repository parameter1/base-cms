const gql = require('graphql-tag');

module.exports = gql`
  query IdXIdentifyCustomer($id: String!) {
    customerByEncryptedId(input: { id: $id, errorOnNotFound: false }) {
      id
      primaryEmailAddress { emailAddress }
    }
  }
`;
