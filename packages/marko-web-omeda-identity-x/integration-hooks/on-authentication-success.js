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
    formatter,
    idxOmedaRapidIdentify,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
    promoCode: hookDataPromoCode,
    res,
    user,
  } = validate(Joi.object({
    appendBehaviors: Joi.array().items(schemas.appendBehavior).default([]),
    appendDemographics: Joi.array().items(schemas.appendDemographic).default([]),
    appendPromoCodes: Joi.array().items(schemas.appendPromoCode).default([]),
    behavior: schemas.behavior.required(),
    brandKey: props.brandKey.required(),
    formatter: Joi.function().required(),
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

  const payload = await formatter({
    req,
    payload: {
      user,
      behavior,
      promoCode,
      appendBehaviors,
      appendDemographics,
      appendPromoCodes,
    },
  });
  await idxOmedaRapidIdentify(payload);
};
