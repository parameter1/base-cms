const { decode } = require('jsonwebtoken');

const { log } = console;

/**
 * Syncs Auth0 and IdentityX user states
 *
 * @param {RequestContext} req
 * @param {ResponseContext} res
 * @param {Object} session
 * @returns Object the Auth0 user session object
 */
module.exports = async (req, _, session) => {
  // Only handle if Auth0 & IdentityX are loaded
  if (!req.identityX) throw new Error('IdentityX must be enabled and configured!');

  const { identityX: service } = req;
  const { token } = service;
  const user = await decode(session.id_token);

  // If there's no Auth0 context, or an IdX context already exists, there's nothing to do here.
  if (!user || token) return session;

  // Destroy A0 context if no email is present
  const { email, email_verified: ev } = user;
  if (!email || !ev) throw new Error('Auth0 user must provide a verified email address.');

  // Upsert the IdentityX AppUser
  const appUser = await service.createAppUser({ email });

  // federate trusted verification state to IdX and log in via impersonation api
  try {
    await service.impersonateAppUser({ userId: appUser.id });
    log('A0+IdX.cb', 'impersonated', appUser.id);
  } catch (e) {
    log('A0+IdX.cb', 'autherr', e);
    throw e;
  }

  // Return the user session
  return session;
};
