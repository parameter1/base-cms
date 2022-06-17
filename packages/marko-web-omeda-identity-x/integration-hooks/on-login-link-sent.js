const extractPromoCode = require('../utils/extract-promo-code');
const {
  getOmedaCustomerRecord,
  getOmedaLinkedFields,
  setOmedaData,
  setOmedaDemographics,
  setOmedaDeploymentTypes,
  getAnsweredQuestionMap,
} = require('../omeda-data');


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

  const answeredQuestionMap = getAnsweredQuestionMap(user);
  const hasAnsweredAllOmedaQuestions = omedaLinkedFields
    .demographic.every(field => answeredQuestionMap.has(field.id))
    && omedaLinkedFields
      .deploymentType.every(field => answeredQuestionMap.has(field.id));

  // If the user is verified and has answered all Omeda questions, do nothing.
  if (user.verified && hasAnsweredAllOmedaQuestions) {
    return;
  }

  // find the omeda customer record to "prime" the identity-x user.
  const omedaCustomer = await getOmedaCustomerRecord({ omedaGraphQLClient, encryptedCustomerId });

  // Only set existing omeda data to IdentityX if the user is not yet verified (aka, new user)
  if (!user.verified) await setOmedaData({ identityX, user, omedaCustomer });

  // If the IdX user is missing answers, set from existing omeda demos (custom select/bool fields)
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
