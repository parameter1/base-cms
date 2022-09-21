/**
 *
 */
module.exports = ({ req, requiresRegistration = false }) => {
  const hasUser = req.oidc ? req.oidc.isAuthenticated() : false;
  return {
    isEnabled: Boolean(req.oidc),
    hasUser,
    canAccess: (requiresRegistration === false) || hasUser,
  };
};
