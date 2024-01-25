const Joi = require('@parameter1/joi');
const { hook } = require('../props');

/**
 * @typedef HookPromoCodeSchema
 * @prop {import('@parameter1/base-cms-marko-web-identity-x/hooks').HookTypeEnum} hook
 * @prop {string} promoCode
 */
module.exports = Joi.object({
  hook: hook.required(),
  promoCode: Joi.string().required(),
});
