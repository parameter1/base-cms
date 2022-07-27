const Joi = require('@parameter1/joi');
const { demographicId, valueId, hook } = require('../props');

module.exports = Joi.object({
  hook: hook.required(),
  demographicId: demographicId.required(),
  valueIds: Joi.array().items(valueId.required()).required(),
  writeInValue: Joi.string(),
});
