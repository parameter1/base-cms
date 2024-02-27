const gql = require('graphql-tag');

const query = gql`
  query CustomerByEncryptedId($id: String!) {
    customerByEncryptedId(input: { id: $id, errorOnNotFound: false }) {
      id
      firstName
      lastName
      title
      companyName
      primaryPostalAddress {
        countryCode
        regionCode
        postalCode
        street
        extraAddress
        city
      }
      primaryMobileNumber {
        phoneNumber
      }
      primaryPhoneNumber {
        phoneNumber
      }
      demographics {
        demographic { id description }
        value { id description }
        writeInDesc
      }
      primaryEmailAddress {
        optInStatus { deploymentTypeId status { id } }
      }
      subscriptions {
        product { id deploymentTypeId }
        receive
      }
    }
  }
`;

module.exports = async ({ omedaGraphQLClient, encryptedCustomerId }) => {
  const variables = { id: encryptedCustomerId };
  const { data } = await omedaGraphQLClient.query({ query, variables });
  return data.customerByEncryptedId;
};
