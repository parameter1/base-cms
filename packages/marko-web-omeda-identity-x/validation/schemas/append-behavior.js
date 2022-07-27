const Joi = require('@parameter1/joi');
const { behaviorId } = require('../props');

module.exports = Joi.object({
  behaviorId: behaviorId.required(),
});
