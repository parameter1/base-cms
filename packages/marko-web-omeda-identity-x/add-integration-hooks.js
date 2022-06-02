
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
module.exports = ({
  idxConfig,
  brandKey,
  omedaGraphQLProp = '$omedaGraphQLClient',
  idxOmedaRapidIdentifyProp = '$idxOmedaRapidIdentify',
} = {}) => {
  if (!idxConfig) throw new Error('The IdentityX configuration instances is required to add Omeda+IdentityX integration hooks.');
  idxConfig.addHook({
    name: 'onLoginLinkSent',
    shouldAwait: false,
    fn: async args => onLoginLinkSent({
      ...args,
      brandKey,
      omedaGraphQLProp,
      idxOmedaRapidIdentifyProp,

      req: args.req,
      service: args.service,
      user: args.user,
    }),
  });

  idxConfig.addHook({
    name: 'onAuthenticationSuccess',
    shouldAwait: true,
    fn: async ({ user, res }) => onAuthenticationSuccess({ brandKey, user, res }),
  });

  idxConfig.addHook({
    name: 'onUserProfileUpdate',
    shouldAwait: false,
    fn: async args => onUserProfileUpdate({
      ...args,
      idxOmedaRapidIdentifyProp,
      req: args.req,
      user: args.user,
    }),
  });

  idxConfig.addHook({
    name: 'onLogout',
    shouldAwait: true,
    fn: async ({ res }) => onLogout({ res }),
  });

  return idxConfig;
};
