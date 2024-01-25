const Joi = require('@parameter1/joi');
const { behaviorId, hook } = require('../props');

/**
 * @typedef HookBehaviorSchema
 * @prop {import('@parameter1/base-cms-marko-web-identity-x/hooks').HookTypeEnum} hook
 * @prop {number} behaviorId
 */
module.exports = Joi.object({
  hook: hook.required(),
  behaviorId: behaviorId.required(),
});
