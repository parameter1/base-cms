
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
  productId,
  omedaGraphQLProp = '$omeda',
} = {}) => {
  if (!idxConfig) throw new Error('The IdentityX configuration instances is required to add Omeda+IdentityX integration hooks.');
  if (!brandKey) throw new Error('An Omeda brand key is required to add Omeda+IdentityX integration hooks.');
  if (!productId) throw new Error('An Omeda rapid identification product ID is required to add Omeda+IdentityX integration hooks.');
  idxConfig.addHook({
    name: 'onLoginLinkSent',
    shouldAwait: false,
    fn: async ({ req, service, user }) => onLoginLinkSent({
      brandKey,
      productId,
      omedaGraphQLProp,

      req,
      service,
      user,
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
    fn: async ({ user, service, req }) => onUserProfileUpdate({
      brandKey,
      productId,
      omedaGraphQLProp,

      user,
      service,
      req,
    }),
  });

  idxConfig.addHook({
    name: 'onLogout',
    shouldAwait: true,
    fn: async ({ res }) => onLogout({ res }),
  });

  return idxConfig;
};
