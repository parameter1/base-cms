const gql = require('graphql-tag');
const { get, getAsArray } = require('@parameter1/base-cms-object-path');


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

  const demographics = getAsArray(appUser, 'customSelectFieldAnswers').filter((select) => {
    const { field, hasAnswered } = select;
    if (!field.externalId || !hasAnswered) return false;
    const { namespace, identifier } = field.externalId;
    return namespace.provider === 'omeda'
      && namespace.tenant === brandKey.toLowerCase()
      && namespace.type === 'demographic'
      && parseInt(identifier.value, 10)
      && select.answers.some(answer => answer.externalIdentifier);
  }).map((select) => {
    const { field } = select;
    const { identifier } = field.externalId;
    return {
      id: parseInt(identifier.value, 10),
      values: select.answers.map(answer => answer.externalIdentifier).filter(v => v),
    };
  });

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
    ...(demographics.length && { demographics }),
  };
  const { data } = await omedaGraphQL.mutate({
    mutation: RAPID_IDENT,
    variables: { input },
  });
  const { id, encryptedCustomerId } = data.result;

  const namespace = { provider: 'omeda', tenant: brandKey.toLowerCase(), type: 'customer' };
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
  return { id, encryptedCustomerId };
};
