const Joi = require('@parameter1/joi');
const { demographicId, valueId } = require('../props');

module.exports = Joi.object({
  demographicId: demographicId.required(),
  valueIds: Joi.array().items(valueId.required()).required(),
  writeInValue: Joi.string(),
});
