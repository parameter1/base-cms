const { asyncRoute } = require('@parameter1/base-cms-utils');

const { log } = console;

module.exports = asyncRoute(async (req, _, next) => {
  // Only handle if Auth0 & IdentityX are loaded
  if (!req.oidc || !req.identityX) throw new Error('Auth0 and IdentityX must be enabled!');

  const { identityX: idxSvc } = req;
  const { user } = req.oidc;

  // the Auth0 user has been logged out, log out the IdentityX user.
  if (!user && idxSvc.token) {
    log('A0+IdX.mw', 'logout', 'No Auth0 user context detected!');
    await idxSvc.logoutAppUser();
  }
  return next();
});
