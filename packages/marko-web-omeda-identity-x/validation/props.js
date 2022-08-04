const Joi = require('@parameter1/joi');
const IdXConfig = require('@parameter1/base-cms-marko-web-identity-x/config');
const validHooks = require('@parameter1/base-cms-marko-web-identity-x/hooks');

module.exports = {
  behaviorAttribute: Joi.object({
    id: Joi.number().required(),
    valueId: Joi.number(),
    value: Joi.string(),
  }).xor('valueId', 'value'),
  behaviorId: Joi.number(),
  brandKey: Joi.string().trim().lowercase(),
  clientKey: Joi.string().trim().lowercase(),
  demographicId: Joi.number(),
  hook: Joi.string().valid(...validHooks),
  idxConfig: Joi.object().instance(IdXConfig),
  promoCode: Joi.string(),
  valueId: Joi.number(),
  writeInValue: Joi.string(),
};
