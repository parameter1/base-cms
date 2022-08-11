const Joi = require('@parameter1/joi');

module.exports = Joi.object({
  promoCode: Joi.string().required(),
});
