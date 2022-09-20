const { asyncRoute } = require('@parameter1/base-cms-utils');

const { log } = process.env.NODE_ENV === 'development' ? console : { log: v => v };

module.exports = asyncRoute(async (req, _, next) => {
  // Only handle if Auth0 & IdentityX are loaded
  if (!req.oidc || !req.identityX) return next();

  const { identityX: idxSvc } = req;
  const { token } = idxSvc;
  const { user } = req.oidc;
  log('A0+IdX.mw', { email: user && user.email, token });

  // the Auth0 user has been logged out, log out the IdentityX user.
  if (!user && idxSvc.token) {
    log('A0+IdX.mw', 'logout', 'No Auth0 user context detected!');
    await idxSvc.logoutAppUser();
  }
  return next();
});
