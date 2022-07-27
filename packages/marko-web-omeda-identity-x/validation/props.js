const Joi = require('@parameter1/joi');
const IdXConfig = require('@parameter1/base-cms-marko-web-identity-x/config');

module.exports = {
  behaviorId: Joi.number(),
  brandKey: Joi.string().trim().lowercase(),
  clientKey: Joi.string().trim().lowercase(),
  demographicId: Joi.number(),
  idxConfig: Joi.object().instance(IdXConfig),
  promoCode: Joi.string(),
  valueId: Joi.number(),
  writeInValue: Joi.string(),
};
