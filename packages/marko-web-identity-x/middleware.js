const { asyncRoute } = require('@parameter1/base-cms-utils');
const IdentityX = require('./service');

/**
 * An Express middleware that injects the IdentityX service.
 *
 * @param {IdentityXConfiguration} config The IdentityX config object
 * @returns {function} The middleware function
 *
 * @typedef IdentityXRequest
 * @prop {IdentityX} identityX The IdentityX service instance
 */
module.exports = (config) => asyncRoute(async (req, res, next) => {
  const service = new IdentityX({ req, res, config });
  req.identityX = service;
  res.locals.identityX = service;

  const cookie = service.getIdentity(res);

  // Don't overwrite an existing cookie
  if (cookie) return next();

  // Set cookie for logged in users
  if (service.token) {
    const { user } = await service.loadActiveContext();
    if (user && user.id) {
      service.setIdentityCookie(user.id);
    }
  }

  return next();
});
