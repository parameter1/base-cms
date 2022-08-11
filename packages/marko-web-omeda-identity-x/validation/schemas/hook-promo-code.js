const Joi = require('@parameter1/joi');
const { hook } = require('../props');

module.exports = Joi.object({
  hook: hook.required(),
  promoCode: Joi.string().required(),
});
