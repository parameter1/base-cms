const extractPromoCode = require('../utils/extract-promo-code');
const {
  getAnsweredQuestionMap,
  getOmedaCustomerRecord,
  getOmedaLinkedFields,
  updateIdentityX,
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

  // const appendBehavior = config.get('hookBehaviors.onLoginLinkSent');
  // const appendDemographic = config.get('hookDemographics.onLoginLinkSent');
  // const appendPromoCode = config.get('hookPromoCodes.onLoginLinkSent');

  // get omeda customer id (via rapid identity) and load omeda custom field data
  const [omedaLinkedFields, { encryptedCustomerId }] = await Promise.all([
    getOmedaLinkedFields({ identityX, brandKey }),
    idxOmedaRapidIdentify({
      user: user.verified ? user : { id: user.id, email: user.email },
      ...(promoCode && { promoCode }),
      // ...(appendBehavior && { appendBehavior }),
      // ...(appendDemographic && { appendDemographic }),
      // ...(appendPromoCode && { appendPromoCode }),
    }),
  ]);

  const answers = getAnsweredQuestionMap(user);
  const hasAllDemos = omedaLinkedFields.demographic.every(field => answers.has(field.id));
  const hasAllDeployments = omedaLinkedFields.deploymentType.every(field => answers.has(field.id));
  const hasAllProducts = omedaLinkedFields.product.every(field => answers.has(field.id));
  const hasAnsweredAllOmedaQuestions = hasAllDemos && hasAllDeployments && hasAllProducts;

  // If the user is verified and has answered all Omeda questions, do nothing.
  if (user.verified && hasAnsweredAllOmedaQuestions) return;

  // Find the Omeda customer record to prime the identity-x user record.
  const omedaCustomer = await getOmedaCustomerRecord({ omedaGraphQLClient, encryptedCustomerId });

  // Update the IdentityX user record with the Omeda data (if any is present)
  await updateIdentityX({
    identityX,
    brandKey,
    user,
    omedaCustomer,
    omedaLinkedFields,
  }, {
    // Only set existing Omeda data to IdentityX if the user is not yet verified (aka, new user)
    updateData: !user.verified,
    // Update each type of linked (custom select/boolean) field if any are missing a value.
    updateDemographics: !hasAllDemos,
    updateDeploymentTypes: !hasAllDeployments,
    updateProducts: !hasAllProducts,
  });
};
