const gql = require('graphql-tag');
const { get } = require('@parameter1/base-cms-object-path');


const RAPID_IDENT = gql`
  mutation RapidIdentityX($input: RapidCustomerIdentificationMutationInput!) {
    result: rapidCustomerIdentification(input: $input) {
      id
      encryptedCustomerId
    }
  }
`;

const getAlpha3CodeFor = async (alpha2, identityX) => {
  const { data } = await identityX.client.query({
    query: gql`
      query GetAlpha3Code($alpha2: String!) {
        localeCountry(input: { code: $alpha2 }) {
          id
          alpha3
        }
      }
    `,
    variables: { alpha2 },
  });
  return get(data, 'localeCountry.alpha3');
};

/**
 *
 * @param {object} params
 * @param {string} params.brandKey The Omeda brand key
 * @param {number} params.productId The Omeda product ID to associate with the identification
 * @param {object} params.appUser The IdentityX user
 * @param {IdentityX} params.identityX The Marko web IdentityX service
 * @param {ApolloClient} params.omedaGraphQL The Omeda GraphQL client
 */
module.exports = async ({
  brandKey,
  productId,
  appUser,
  identityX,
  omedaGraphQL,
} = {}) => {
  const {
    givenName,
    familyName,
    organization,
    organizationTitle,
    countryCode,
    regionCode,
    postalCode,
  } = appUser;

  let alpha3;
  if (countryCode) {
    // omeda requires and ISO alpha3 country code.
    alpha3 = await getAlpha3CodeFor(countryCode, identityX);
  }

  const input = {
    productId,
    email: appUser.email,
    ...(givenName && { firstName: givenName }),
    ...(familyName && { lastName: familyName }),
    ...(organization && { companyName: organization }),
    ...(organizationTitle && { title: organizationTitle }),
    ...(alpha3 && { countryCode: alpha3 }),
    ...(regionCode && { regionCode }),
    ...(postalCode && { postalCode }),
  };
  const { data } = await omedaGraphQL.mutate({
    mutation: RAPID_IDENT,
    variables: { input },
  });
  const { id, encryptedCustomerId } = data.result;

  const namespace = { provider: 'omeda', tenant: brandKey, type: 'customer' };
  await Promise.all([
    identityX.addExternalUserId({
      userId: appUser.id,
      identifier: { value: `${id}` },
      namespace,
    }),
    identityX.addExternalUserId({
      userId: appUser.id,
      identifier: { value: encryptedCustomerId, type: 'encrypted' },
      namespace,
    }),
  ]);
};
