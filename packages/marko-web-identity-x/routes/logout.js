const { asyncRoute } = require('@parameter1/base-cms-utils');
const contextCookie = require('../utils/context-cookie');
const tokenCookie = require('../utils/token-cookie');
const callHooksFor = require('../utils/call-hooks-for');

module.exports = asyncRoute(async (req, res) => {
  /** @type {import('../middleware').IdentityXRequest} */
  const { identityX } = req;
  contextCookie.removeFrom(res);
  const token = tokenCookie.getFrom(req);
  if (!token) {
    await callHooksFor(identityX, 'onLogout', { req, res });
  } else {
    await identityX.logoutAppUser({ token });
  }
  res.json({ ok: true });
});
