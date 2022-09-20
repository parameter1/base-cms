const { get } = require('object-path');
const { decode } = require('jsonwebtoken');
const gql = require('graphql-tag');

const { log } = process.env.NODE_ENV === 'development' ? console : { log: v => v };

const findUser = gql`
query LoginCheckAppUser($email: String!) {
  appUser(input: { email: $email }) {
    id
    email
    verified
  }
}
`;

/**
 * Syncs Auth0 and IdentityX user states
 *
 * @param {RequestContext} req
 * @param {ResponseContext} res
 * @param {Object} session
 * @returns Object the Auth0 user session object
 */
module.exports = async (req, res, session, decoded) => {
  // Only handle if Auth0 & IdentityX are loaded
  if (!req.identityX) return session;

  const { identityX: service } = req;
  const { token, client } = service;
  const user = await decode(session.id_token);

  // If there's no Auth0 context, or an IdX context already exists, there's nothing to do here.
  if (!user || token) return session;

  log('A0+IdX.cb', { email: user && user.email, token, decoded });

  // Destroy A0 context if no email is present
  const { email } = user;
  if (!email) {
    res.oidc.logout();
    throw new Error('Auth0 users must provide an email address.'); // @todo flash/log?
  }

  // Attempt to load the IdentityX AppUser by email address
  const qr = await client.query({ query: findUser, variables: { email } });
  let appUser = get(qr, 'data.appUser');
  if (appUser) log('A0+IdX.cb', 'retrieved user', appUser && appUser.id);

  // Create the IdentityX AppUser if they couldn't be retrieved
  if (!appUser) {
    appUser = await service.createAppUser({ email });
    log('A0+IdX.cb', 'created user', appUser);
  }

  if (user.email_verified) {
    // federate trusted verification state to IdX and log in via impersonation api
    try {
      await service.impersonateAppUser({ userId: appUser.id });
      log('A0+IdX.cb', 'logged in as', appUser.id);
    } catch (e) {
      log('A0+IdX.cb', 'autherr', e.networkError ? e.networkError.result.errors : e);
      res.oidc.logout();
      throw e; // @todo flash/log
    }
  } else {
    // Email is not verified, force verification via IdentityX
    await service.sendLoginLink({ appUser });
    throw new Error('Please verify your email address to continue.'); // @todo flash/log
  }
  return session;
};
