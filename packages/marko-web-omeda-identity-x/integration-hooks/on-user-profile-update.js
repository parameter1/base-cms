const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');
const extractPromoCode = require('../utils/extract-promo-code');
const schemas = require('../validation/schemas');

module.exports = async (params = {}) => {
  const {
    appendBehaviors,
    appendDemographics,
    appendPromoCodes,
    behavior,
    idxOmedaRapidIdentify,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
    promoCode: hookDataPromoCode,
    req,
    user,
  } = validate(Joi.object({
    appendBehaviors: Joi.array().items(schemas.appendBehavior).default([]),
    appendDemographics: Joi.array().items(schemas.appendDemographic).default([]),
    appendPromoCodes: Joi.array().items(schemas.appendPromoCode).default([]),
    behavior: schemas.behavior.required(),
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
    behavior,
    ...(promoCode && { promoCode }),
    appendBehaviors,
    appendDemographics,
    appendPromoCodes,
  });
};
