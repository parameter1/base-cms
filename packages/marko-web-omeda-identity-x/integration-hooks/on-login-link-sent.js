const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');
const extractPromoCode = require('../utils/extract-promo-code');
const { appendBehavior, appendDemographic, appendPromoCode } = require('../validation/schemas');
const {
  getAnsweredQuestionMap,
  getOmedaCustomerRecord,
  getOmedaLinkedFields,
  updateIdentityX,
} = require('../omeda-data');
const props = require('../validation/props');

module.exports = async (params = {}) => {
  const {
    appendBehaviors,
    appendDemographics,
    appendPromoCodes,
    brandKey,
    idxOmedaRapidIdentify,
    omedaGraphQLClient,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
    promoCode: hookDataPromoCode,
    req,
    service: identityX,
    user,
  } = validate(Joi.object({
    appendBehaviors: Joi.array().items(appendBehavior.required()).default([]),
    appendDemographics: Joi.array().items(appendDemographic.required()).default([]),
    appendPromoCodes: Joi.array().items(appendPromoCode.required()).default([]),
    brandKey: props.brandKey.required(),
    idxOmedaRapidIdentify: Joi.function().required(),
    omedaGraphQLClient: Joi.object().required(),
    omedaPromoCodeCookieName: Joi.string().required(),
    omedaPromoCodeDefault: Joi.string(),
    promoCode: Joi.string(),
    req: Joi.object().required(),
    service: Joi.object().required(),
    user: Joi.object().required(),
  }).unknown(), params);

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
      ...(appendBehaviors && { appendBehaviors }),
      ...(appendDemographics && { appendDemographics }),
      ...(appendPromoCodes.length && { promoCode: appendPromoCodes[0].promoCode }),
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
