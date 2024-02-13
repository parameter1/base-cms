const { asyncRoute } = require('@parameter1/base-cms-utils');

module.exports = asyncRoute(async (req, res) => {
  /** @type {import('../middleware').IdentityXRequest} */
  const { identityX, body } = req;
  const { email } = body;
  const entity = await identityX.generateEntityId();

  // Send login link.
  await identityX.sendChangeEmailLink({ email });
  await identityX.logoutAppUser();
  return res.json({
    ok: true,
    entity,
  });
});
