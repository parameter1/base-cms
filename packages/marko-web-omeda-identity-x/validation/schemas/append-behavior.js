const Joi = require('@parameter1/joi');
const { behaviorAttribute, behaviorId } = require('../props');

module.exports = Joi.object({
  behaviorId: behaviorId.required(),
  attributes: Joi.array().items(behaviorAttribute.required()).default([]),
});
