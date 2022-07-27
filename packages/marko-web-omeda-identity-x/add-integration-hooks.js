const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');
const { get } = require('@parameter1/base-cms-object-path');
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
    idxConfig,
    brandKey,
    omedaGraphQLClientProp,
    idxOmedaRapidIdentifyProp,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
  } = validate(Joi.object({
    brandKey: props.brandKey.required(),
    idxConfig: props.idxConfig.required(),
    idxOmedaRapidIdentifyProp: Joi.string().required(),
    omedaGraphQLClientProp: Joi.string().required(),
    omedaPromoCodeCookieName: Joi.string().required(),
    omedaPromoCodeDefault: Joi.string(),
  }), params);

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
    }),
  });

  idxConfig.addHook({
    name: 'onLogout',
    shouldAwait: true,
    fn: async args => onLogout({
      ...args,
    }),
  });

  return idxConfig;
};
