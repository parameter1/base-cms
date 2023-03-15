const Joi = require('@parameter1/joi');

module.exports = Joi.object({
  onLoginLinkSent: Joi.boolean().default(false),
  onAuthenticationSuccess: Joi.boolean().default(true),
  onUserProfileUpdate: Joi.boolean().default(false),
}).default();
