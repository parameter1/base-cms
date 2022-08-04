const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');
const olyticsCookie = require('@parameter1/base-cms-marko-web-omeda/olytics/customer-cookie');
const extractPromoCode = require('../utils/extract-promo-code');
const findEncryptedId = require('../external-id/find-encrypted-customer-id');
const props = require('../validation/props');
const schemas = require('../validation/schemas');

module.exports = async (params = {}) => {
  const {
    appendBehaviors,
    appendDemographics,
    appendPromoCodes,
    behavior,
    brandKey,
    idxOmedaRapidIdentify,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
    promoCode: hookDataPromoCode,
    res,
    user,
  } = validate(Joi.object({
    appendBehaviors: Joi.array().items(schemas.appendBehavior.required()).default([]),
    appendDemographics: Joi.array().items(schemas.appendDemographic.required()).default([]),
    appendPromoCodes: Joi.array().items(schemas.appendPromoCode.required()).default([]),
    behavior: schemas.behavior.required(),
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
    behavior,
    ...(promoCode && { promoCode }),
    ...(appendBehaviors && { appendBehaviors }),
    ...(appendDemographics && { appendDemographics }),
    ...(appendPromoCodes.length && { promoCode: appendPromoCodes[0].promoCode }),
  });
};
