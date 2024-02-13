const { asyncRoute } = require('@parameter1/base-cms-utils');

module.exports = asyncRoute(async (req, res) => {
  /** @type {import('../middleware').IdentityXRequest} */
  const { identityX, body } = req;
  const { email } = body;

  // Send login link.
  await identityX.sendChangeEmailLink({ email });
  await identityX.logoutAppUser();
  return res.json({ ok: true });
});
