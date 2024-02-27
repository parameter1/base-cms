const gql = require('graphql-tag');
const { get } = require('@parameter1/base-cms-object-path');

const SET_OMEDA_DATA = gql`
mutation SetOmedaData($input: SetAppUserUnverifiedDataMutationInput!) {
  setAppUserUnverifiedData(input: $input) { id }
}
`;

/**
* Sets Omeda customer data (such as name, address, etc) to the IdentityX user fields.
*/
module.exports = async ({ identityX, user, omedaCustomer }) => {
  const input = {
    email: user.email,

    givenName: omedaCustomer.firstName,
    familyName: omedaCustomer.lastName,
    organization: omedaCustomer.companyName,
    organizationTitle: omedaCustomer.title,

    countryCode: get(omedaCustomer, 'primaryPostalAddress.countryCode'),
    regionCode: get(omedaCustomer, 'primaryPostalAddress.regionCode'),
    postalCode: get(omedaCustomer, 'primaryPostalAddress.postalCode'),
    street: get(omedaCustomer, 'primaryPostalAddress.street'),
    addressExtra: get(omedaCustomer, 'primaryPostalAddress.extraAddress'),
    city: get(omedaCustomer, 'primaryPostalAddress.city'),
    mobileNumber: get(omedaCustomer, 'primaryMobileNumber.phoneNumber'),
    phoneNumber: get(omedaCustomer, 'primaryPhoneNumber.phoneNumber'),
  };
  return identityX.client.mutate({
    mutation: SET_OMEDA_DATA,
    variables: { input },
  });
};
