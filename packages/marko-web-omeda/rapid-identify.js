const gql = require('graphql-tag');
const debug = require('debug')('omeda');

const RAPID_IDENT = gql`
  mutation RapidIdentityX($input: RapidCustomerIdentificationMutationInput!) {
    result: rapidCustomerIdentification(input: $input) { id encryptedCustomerId }
  }
`;

const { isArray } = Array;

module.exports = async (omedaGraphQLClient, {
  email,
  productId,

  firstName,
  lastName,
  companyName,
  title,

  regionCode,
  countryCode,
  postalCode,

  street,
  addressExtra,
  city,
  phoneNumber,
  mobileNumber,

  // deprecated, use `deploymentTypes` instead
  deploymentTypeIds,

  deploymentTypes,
  demographics,
  subscriptions,
  behaviors,

  promoCode,
} = {}) => {
  const input = {
    productId: parseInt(productId, 10),
    email,
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
    ...(companyName && { companyName }),
    ...(title && { title }),

    ...(regionCode && { regionCode }),
    ...(countryCode && { countryCode }),
    ...(postalCode && { postalCode }),

    ...(street && { streetAddress: street }),
    ...(addressExtra && { extraAddress: addressExtra }),
    ...(city && { city }),
    ...(phoneNumber && { phoneNumber }),
    ...(mobileNumber && { mobileNumber }),

    ...(isArray(deploymentTypeIds) && deploymentTypeIds.length && { deploymentTypeIds }),
    ...(isArray(deploymentTypes) && deploymentTypes.length && { deploymentTypes }),
    ...(isArray(demographics) && demographics.length && { demographics }),
    ...(isArray(subscriptions) && subscriptions.length && { subscriptions }),
    ...(isArray(behaviors) && behaviors.length && { behaviors }),

    ...(promoCode && { promoCode }),
  };
  const { data } = await omedaGraphQLClient.mutate({
    mutation: RAPID_IDENT,
    variables: { input },
  });
  debug('rapid-identify', input, data);
  return data.result;
};
