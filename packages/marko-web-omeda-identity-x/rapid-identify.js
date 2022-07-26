const gql = require('graphql-tag');
const { get, getAsArray } = require('@parameter1/base-cms-object-path');
const isOmedaDemographicId = require('./external-id/is-demographic-id');
const isDeploymentTypeId = require('./external-id/is-deployment-type-id');
const isProductId = require('./external-id/is-product-id');

const ALPHA3_CODE = gql`
  query GetAlpha3Code($alpha2: String!) {
    localeCountry(input: { code: $alpha2 }) { id alpha3 }
  }
`;

const getAlpha3CodeFor = async (alpha2, identityX) => {
  const { data } = await identityX.client.query({
    query: ALPHA3_CODE,
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
 * @param {string} [params.promoCode] An optional code to send to Omeda for tracking the
 *                                    acquisition source
 * @param {IdentityX} params.identityX The Marko web IdentityX service
 * @param {function} params.omedaRapidIdentify The Omeda rapid identifcation action
 */
module.exports = async ({
  brandKey,
  productId,
  appUser,

  promoCode,

  identityX,
  omedaRapidIdentify,
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
    if (!field.active || !field.externalId || !hasAnswered) return false;
    return isOmedaDemographicId({ externalId: field.externalId, brandKey })
      && select.answers.some(answer => answer.externalIdentifier);
  }).map((select) => {
    const { field } = select;
    const { identifier } = field.externalId;
    const writeInValue = select.answers.reduce((v, answer) => (v || answer.writeInValue), null);
    return {
      id: parseInt(identifier.value, 10),
      values: select.answers.map(answer => answer.externalIdentifier).filter(v => v),
      ...(writeInValue && { writeInValue }),
    };
  });

  const deploymentTypes = [];
  const subscriptions = [];
  getAsArray(appUser, 'customBooleanFieldAnswers').forEach((boolean) => {
    const { field, hasAnswered } = boolean;
    const { externalId } = field;
    if (!field.active || !externalId || !hasAnswered) return;

    const { identifier } = field.externalId;
    const id = parseInt(identifier.value, 10);

    if (isOmedaDemographicId({ externalId, brandKey })) {
      demographics.push({ id, values: [`${boolean.value}`] });
    }

    if (isDeploymentTypeId({ externalId, brandKey })) {
      deploymentTypes.push({ id, optedIn: boolean.answer });
    }

    if (isProductId({ externalId, brandKey })) {
      subscriptions.push({ id, receive: boolean.answer });
    }
  });

  const { id, encryptedCustomerId } = await omedaRapidIdentify({
    email: appUser.email,
    productId,
    ...(givenName && { firstName: givenName }),
    ...(familyName && { lastName: familyName }),
    ...(organization && { companyName: organization }),
    ...(organizationTitle && { title: organizationTitle }),
    ...(alpha3 && { countryCode: alpha3 }),
    ...(regionCode && { regionCode }),
    ...(postalCode && { postalCode }),
    ...(demographics.length && { demographics }),
    ...(deploymentTypes.length && { deploymentTypes }),
    ...(promoCode && { promoCode }),
    ...(subscriptions.length && { subscriptions }),
  });

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
