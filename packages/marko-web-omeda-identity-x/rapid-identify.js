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

  deploymentTypes = [],

  appendBehaviors,
  appendDemographics,
  appendPromoCodes,

  behavior,

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
    street,
    addressExtra,
    city,
    phoneNumber,
  } = appUser;

  let alpha3;
  if (countryCode) {
    // omeda requires and ISO alpha3 country code.
    alpha3 = await getAlpha3CodeFor(countryCode, identityX);
  }

  const behaviors = [{ id: behavior.id, attributes: getAsArray(behavior, 'attributes') }];
  const demographics = getAsArray(appUser, 'customSelectFieldAnswers').filter((select) => {
    const { field, hasAnswered } = select;
    if (!field.active || !field.externalId || !hasAnswered) return false;
    return isOmedaDemographicId({ externalId: field.externalId, brandKey })
      && select.answers.some((answer) => answer.externalIdentifier);
  }).map((select) => {
    const { field } = select;
    const { identifier } = field.externalId;
    const writeInValue = select.answers.reduce((v, answer) => (v || answer.writeInValue), null);
    return {
      id: parseInt(identifier.value, 10),
      values: select.answers.map((answer) => answer.externalIdentifier).filter((v) => v),
      ...(writeInValue && { writeInValue }),
    };
  });

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

  // Append custom demographic answer, if specified
  if (appendDemographics && appendDemographics.length) {
    appendDemographics.forEach(({ demographicId, valueIds, writeInValue }) => {
      demographics.push({
        id: demographicId,
        values: valueIds.map((v) => `${v}`),
        ...(writeInValue && { writeInValue }),
      });
    });
  }

  // Append custom behavior, if specified
  if (appendBehaviors && appendBehaviors.length) {
    appendBehaviors.forEach(({ behaviorId, attributes }) => {
      behaviors.push({
        id: behaviorId,
        // Only pass attributes through if they are present
        ...(attributes && attributes.length && {
          attributes: attributes.map((attr) => ({
            id: attr.id,
            ...(attr.valueId && { valueId: attr.valueId }),
            ...(attr.value && { value: attr.value }),
          })),
        }),
      });
    });
  }

  const promoCodes = [];
  if (promoCode) promoCodes.push(promoCode);

  // Append promo codes, if specified
  if (appendPromoCodes && appendPromoCodes.length) {
    appendPromoCodes.forEach((code) => promoCodes.push(code.promoCode));
  }

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
    ...(street && { street }),
    ...(addressExtra && { addressExtra }),
    ...(city && { city }),
    ...(phoneNumber && { phoneNumber }),
    ...(demographics.length && { demographics }),
    ...(behaviors.length && { behaviors }),
    ...(deploymentTypes.length && { deploymentTypes }),
    ...(promoCodes.length && { promoCode: [...promoCodes].pop() }),
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
