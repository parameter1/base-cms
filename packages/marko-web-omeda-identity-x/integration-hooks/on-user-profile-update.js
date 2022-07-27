const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');
const extractPromoCode = require('../utils/extract-promo-code');
const { appendBehavior, appendDemographic, appendPromoCode } = require('../validation/schemas');

module.exports = async (params = {}) => {
  const {
    appendBehaviors,
    appendDemographics,
    appendPromoCodes,
    idxOmedaRapidIdentify,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
    promoCode: hookDataPromoCode,
    req,
    user,
  } = validate(Joi.object({
    appendBehaviors: Joi.array().items(appendBehavior.required()),
    appendDemographics: Joi.array().items(appendDemographic.required()),
    appendPromoCodes: Joi.array().items(appendPromoCode.required()),
    idxOmedaRapidIdentify: Joi.function().required(),
    omedaPromoCodeCookieName: Joi.string().required(),
    omedaPromoCodeDefault: Joi.string(),
    promoCode: Joi.string(),
    req: Joi.object().required(),
    user: Joi.object().required(),
  }).unknown(), params);

  const promoCode = extractPromoCode({
    promoCode: hookDataPromoCode,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
    cookies: req.cookies,
  });

  return idxOmedaRapidIdentify({
    user,
    ...(promoCode && { promoCode }),
    ...(appendBehaviors && { appendBehaviors }),
    ...(appendDemographics && { appendDemographics }),
    ...(appendPromoCodes.length && { promoCode: appendPromoCodes[0].promoCode }),
  });
};
