
const {
  onAuthenticationSuccess,
  onLoginLinkSent,
  onLogout,
  onUserProfileUpdate,
} = require('./integration-hooks');

/**
 *
 * @param {OmedaIdentityXConfiguration} The oIdX config
 */
module.exports = (config) => {
  const idxConfig = config.get('idxConfig');
  if (!idxConfig) throw new Error('The IdentityX configuration instances is required to add Omeda+IdentityX integration hooks.');
  idxConfig.addHook({
    name: 'onLoginLinkSent',
    shouldAwait: false,
    fn: async args => onLoginLinkSent({
      ...args,
      config,
      brandKey: config.getBrandKey(),
      omedaGraphQLProp: config.get('omedaGraphQLProp'),
      idxOmedaRapidIdentifyProp: config.get('idxOmedaRapidIdentifyProp'),

      req: args.req,
      service: args.service,
      user: args.user,
    }),
  });

  idxConfig.addHook({
    name: 'onAuthenticationSuccess',
    shouldAwait: true,
    fn: async args => onAuthenticationSuccess({
      ...args,
      config,
      brandKey: config.getBrandKey(),
      res: args.res,
      req: args.req,
      user: args.user,
    }),
  });

  idxConfig.addHook({
    name: 'onUserProfileUpdate',
    shouldAwait: false,
    fn: async args => onUserProfileUpdate({
      ...args,
      config,
      idxOmedaRapidIdentifyProp: config.get('idxOmedaRapidIdentifyProp'),
      req: args.req,
      user: args.user,
    }),
  });

  idxConfig.addHook({
    name: 'onLogout',
    shouldAwait: true,
    fn: async ({ res }) => onLogout({ res, config }),
  });

  return idxConfig;
};
