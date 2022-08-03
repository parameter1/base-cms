const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');
const olyticsCookie = require('@parameter1/base-cms-marko-web-omeda/olytics/customer-cookie');
const extractPromoCode = require('../utils/extract-promo-code');
const findEncryptedId = require('../external-id/find-encrypted-customer-id');
const props = require('../validation/props');
const { appendBehavior, appendDemographic, appendPromoCode } = require('../validation/schemas');

module.exports = async (params = {}) => {
  const {
    appendBehaviors,
    appendDemographics,
    appendPromoCodes,
    brandKey,
    idxOmedaRapidIdentify,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
    promoCode: hookDataPromoCode,
    res,
    user,
  } = validate(Joi.object({
    appendBehaviors: Joi.array().items(appendBehavior.required()).default([]),
    appendDemographics: Joi.array().items(appendDemographic.required()).default([]),
    appendPromoCodes: Joi.array().items(appendPromoCode.required()).default([]),
    brandKey: props.brandKey.required(),
    user: Joi.object().required(),
    res: Joi.object().required(),
  }).unknown(true), params);
  const encryptedId = findEncryptedId({ externalIds: user.externalIds, brandKey });
  if (!encryptedId) return;
  olyticsCookie.setTo(res, encryptedId);

  const promoCode = extractPromoCode({
    promoCode: hookDataPromoCode,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
    cookies: res.req.cookies,
  });

  await idxOmedaRapidIdentify({
    user,
    ...(promoCode && { promoCode }),
    ...(appendBehaviors && { appendBehaviors }),
    ...(appendDemographics && { appendDemographics }),
    ...(appendPromoCodes.length && { promoCode: appendPromoCodes[0].promoCode }),
  });
};
