const Joi = require('@parameter1/joi');
const { demographicId, valueId, hook } = require('../props');

/**
 * @typedef HookDemographicSchema
 * @prop {import('@parameter1/base-cms-marko-web-identity-x/hooks').HookTypeEnum} hook
 * @prop {number} demographicId
 * @prop {number[]} valueIds
 * @prop {?string} writeInValue
 */
module.exports = Joi.object({
  hook: hook.required(),
  demographicId: demographicId.required(),
  valueIds: Joi.array().items(valueId.required()).required(),
  writeInValue: Joi.string(),
});
