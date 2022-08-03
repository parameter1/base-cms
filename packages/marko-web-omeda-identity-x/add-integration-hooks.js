const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');
const { get } = require('@parameter1/base-cms-object-path');
const schemas = require('./validation/schemas');
const props = require('./validation/props');
const {
  onAuthenticationSuccess,
  onLoginLinkSent,
  onLogout,
  onUserProfileUpdate,
} = require('./integration-hooks');

/**
 *
 * @param {object} params
 * @param {IdentityXConfiguration} params.idxConfig
 */
module.exports = (params = {}) => {
  const {
    appendBehaviorToHook,
    appendDemographicToHook,
    appendPromoCodeToHook,
    idxConfig,
    brandKey,
    omedaGraphQLClientProp,
    idxOmedaRapidIdentifyProp,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
  } = validate(Joi.object({
    appendBehaviorToHook: Joi.array().items(schemas.hookBehavior).default([]),
    appendDemographicToHook: Joi.array().items(schemas.hookDemographic).default([]),
    appendPromoCodeToHook: Joi.array().items(schemas.hookPromoCode).default([]),
    brandKey: props.brandKey.required(),
    idxConfig: props.idxConfig.required(),
    idxOmedaRapidIdentifyProp: Joi.string().required(),
    omedaGraphQLClientProp: Joi.string().required(),
    omedaPromoCodeCookieName: Joi.string().required(),
    omedaPromoCodeDefault: Joi.string(),
  }), params);

  // Return the configured behaviors, demographics, and promocodes for the supplied event/hook
  const buildAppendFor = (hookName) => {
    const appendBehaviors = appendBehaviorToHook
      .filter(({ hook }) => hook === hookName)
      .map(({ hook, ...rest }) => rest);
    const appendDemographics = appendDemographicToHook
      .filter(({ hook }) => hook === hookName)
      .map(({ hook, ...rest }) => rest);
    const appendPromoCodes = appendPromoCodeToHook
      .filter(({ hook }) => hook === hookName)
      .map(({ hook, ...rest }) => rest);
    return {
      ...(appendBehaviors.length && { appendBehaviors }),
      ...(appendDemographics.length && { appendDemographics }),
      ...(appendPromoCodes.length && { appendPromoCodes }),
    };
  };

  idxConfig.addHook({
    name: 'onLoginLinkSent',
    shouldAwait: false,
    fn: async args => onLoginLinkSent({
      ...args,
      brandKey,
      idxOmedaRapidIdentify: get(args, `req.${idxOmedaRapidIdentifyProp}`),
      omedaGraphQLClient: get(args, `req.${omedaGraphQLClientProp}`),
      omedaPromoCodeCookieName,
      omedaPromoCodeDefault,
      ...buildAppendFor('onLoginLinkSent'),
    }),
  });

  idxConfig.addHook({
    name: 'onAuthenticationSuccess',
    shouldAwait: true,
    fn: async args => onAuthenticationSuccess({
      ...args,
      brandKey,
      idxOmedaRapidIdentify: get(args, `req.${idxOmedaRapidIdentifyProp}`),
      omedaPromoCodeCookieName,
      omedaPromoCodeDefault,
      ...buildAppendFor('onAuthenticationSuccess'),
    }),
  });

  idxConfig.addHook({
    name: 'onUserProfileUpdate',
    shouldAwait: false,
    fn: async args => onUserProfileUpdate({
      ...args,
      idxOmedaRapidIdentify: get(args, `req.${idxOmedaRapidIdentifyProp}`),
      omedaPromoCodeCookieName,
      omedaPromoCodeDefault,
      ...buildAppendFor('onUserProfileUpdate'),
    }),
  });

  idxConfig.addHook({
    name: 'onLogout',
    shouldAwait: true,
    fn: async args => onLogout({
      ...args,
      ...buildAppendFor('onLogout'),
    }),
  });

  return idxConfig;
};
