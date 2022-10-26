const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');
const { get } = require('@parameter1/base-cms-object-path');
const appendDataFactory = require('./utils/append-data');
const behaviorFactory = require('./utils/build-behavior');
const schemas = require('./validation/schemas');
const props = require('./validation/props');
const {
  onAuthenticationSuccess,
  onLoginLinkSent,
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
    behaviors,
    behaviorAttributes,
    idxConfig,
    brandKey,
    omedaGraphQLClientProp,
    idxOmedaRapidIdentifyProp,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
    onLoginLinkSentFormatter,
    onAuthenticationSuccessFormatter,
    onUserProfileUpdateFormatter,
  } = validate(Joi.object({
    appendBehaviorToHook: Joi.array().items(schemas.hookBehavior).default([]),
    appendDemographicToHook: Joi.array().items(schemas.hookDemographic).default([]),
    appendPromoCodeToHook: Joi.array().items(schemas.hookPromoCode).default([]),
    behaviors: Joi.object().required(),
    behaviorAttributes: Joi.object().required(),
    brandKey: props.brandKey.required(),
    idxConfig: props.idxConfig.required(),
    idxOmedaRapidIdentifyProp: Joi.string().required(),
    omedaGraphQLClientProp: Joi.string().required(),
    omedaPromoCodeCookieName: Joi.string().required(),
    omedaPromoCodeDefault: Joi.string(),
    onLoginLinkSentFormatter: Joi.function().required(),
    onAuthenticationSuccessFormatter: Joi.function().required(),
    onUserProfileUpdateFormatter: Joi.function().required(),
  }), params);

  const buildBehaviorFor = behaviorFactory({ behaviors, behaviorAttributes });
  const appendDataFor = appendDataFactory({
    behaviors: appendBehaviorToHook,
    demographics: appendDemographicToHook,
    promoCodes: appendPromoCodeToHook,
  });

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
      formatter: onLoginLinkSentFormatter,
      ...appendDataFor('onLoginLinkSent'),
      behavior: buildBehaviorFor('onLoginLinkSent', {
        actionSource: get(args, 'actionSource'),
        newsletterSignupType: get(args, 'newsletterSignupType'),
        contentGateType: get(args, 'contentGateType'),
      }),
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
      formatter: onAuthenticationSuccessFormatter,
      ...appendDataFor('onAuthenticationSuccess'),
      behavior: buildBehaviorFor('onAuthenticationSuccess', {
        actionSource: get(args, 'actionSource'),
        newsletterSignupType: get(args, 'newsletterSignupType'),
        contentGateType: get(args, 'contentGateType'),
      }),
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
      formatter: onUserProfileUpdateFormatter,
      ...appendDataFor('onUserProfileUpdate'),
      behavior: buildBehaviorFor('onUserProfileUpdate', {
        actionSource: get(args, 'actionSource'),
        newsletterSignupType: get(args, 'newsletterSignupType'),
        contentGateType: get(args, 'contentGateType'),
      }),
    }),
  });

  return idxConfig;
};
