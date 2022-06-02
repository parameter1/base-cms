const gql = require('graphql-tag');
const { get } = require('@parameter1/base-cms-object-path');
const extractPromoCode = require('../utils/extract-promo-code');
const {
  getOmedaCustomerRecord,
  getOmedaLinkedFields,
  setOmedaDemographics,
  setOmedaDeploymentTypes,
} = require('../omeda-data');

const SET_OMEDA_DATA = gql`
  mutation SetOmedaData($input: SetAppUserUnverifiedDataMutationInput!) {
    setAppUserUnverifiedData(input: $input) { id }
  }
`;

/**
 * Sets Omeda customer data (such as name, address, etc) to the IdentityX user fields.
 */
const setOmedaData = async ({ identityX, user, omedaCustomer }) => {
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
    phoneNumber: get(omedaCustomer, 'primaryPhoneNumber.phoneNumber'),
  };
  return identityX.client.mutate({
    mutation: SET_OMEDA_DATA,
    variables: { input },
  });
};

module.exports = async ({
  brandKey,
  omedaGraphQLProp = '$omedaGraphQLClient',
  idxOmedaRapidIdentifyProp = '$idxOmedaRapidIdentify',
  omedaPromoCodeCookieName = 'omeda_promo_code',
  omedaPromoCodeDefault,
  promoCode: hookDataPromoCode,

  req,
  service: identityX,
  user,
}) => {
  const omedaGraphQLClient = req[omedaGraphQLProp];
  if (!omedaGraphQLClient) throw new Error(`Unable to load the Omeda GraphQL API from the request using prop ${omedaGraphQLProp}`);
  const idxOmedaRapidIdentify = req[idxOmedaRapidIdentifyProp];
  if (!idxOmedaRapidIdentify) throw new Error(`Unable to find the IdentityX+Omeda rapid identifier on the request using ${idxOmedaRapidIdentifyProp}`);

  const promoCode = extractPromoCode({
    promoCode: hookDataPromoCode,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
    cookies: req.cookies,
  });

  // get omeda customer id (via rapid identity) and load omeda custom field data
  const [omedaLinkedFields, { encryptedCustomerId }] = await Promise.all([
    getOmedaLinkedFields({ identityX, brandKey }),
    idxOmedaRapidIdentify({
      user: user.verified ? user : { id: user.id, email: user.email },
      ...(promoCode && { promoCode }),
    }),
  ]);

  const answeredQuestionMap = new Map();
  user.customSelectFieldAnswers.forEach((select) => {
    if (!select.hasAnswered) return;
    answeredQuestionMap.set(select.field.id, true);
  });
  user.customBooleanFieldAnswers.forEach((boolean) => {
    if (!boolean.hasAnswered) return;
    answeredQuestionMap.set(boolean.field.id, true);
  });

  const hasAnsweredAllOmedaQuestions = omedaLinkedFields
    .demographic.every(field => answeredQuestionMap.has(field.id))
    && omedaLinkedFields
      .deploymentType.every(field => answeredQuestionMap.has(field.id));

  // @todo: Check if a valid answer exists for all omeda questions
  // @todo: user.hasAnsweredAllOmedaQuestions isn't a thing, review this.
  // Possible typo for hasAnsweredAllOmedaQuestions to bypass omeda fetch/updates?
  if (user.verified && user.hasAnsweredAllOmedaQuestions) {
    return;
  }

  // find the omeda customer record to "prime" the identity-x user.
  const omedaCustomer = await getOmedaCustomerRecord({ omedaGraphQLClient, encryptedCustomerId });

  // Only set existing omeda data to IdentityX if the user is not yet verified (aka, new user)
  if (!user.verified) await setOmedaData({ identityX, user, omedaCustomer });
  if (!hasAnsweredAllOmedaQuestions) {
    await setOmedaDemographics({
      identityX,
      user,
      omedaCustomer,
      fields: omedaLinkedFields.demographic,
    });
    await setOmedaDeploymentTypes({
      identityX,
      user,
      omedaCustomer,
      fields: omedaLinkedFields.deploymentType,
    });
  }
};
