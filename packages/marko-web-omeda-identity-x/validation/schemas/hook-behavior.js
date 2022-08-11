const Joi = require('@parameter1/joi');
const { behaviorId, hook } = require('../props');

module.exports = Joi.object({
  hook: hook.required(),
  behaviorId: behaviorId.required(),
});
