const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');
const extractPromoCode = require('../utils/extract-promo-code');

module.exports = async (params = {}) => {
  const {
    idxOmedaRapidIdentify,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
    promoCode: hookDataPromoCode,
    req,
    user,
  } = validate(Joi.object({
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
  });
};
