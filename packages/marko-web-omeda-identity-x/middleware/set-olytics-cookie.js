const { asyncRoute } = require('@parameter1/base-cms-utils');
const olyticsCookie = require('@parameter1/base-cms-marko-web-omeda/olytics/customer-cookie');
const findEncryptedId = require('../external-id/find-encrypted-customer-id');

module.exports = ({
  brandKey,
}) => asyncRoute(async (req, res, next) => {
  const { user } = await req.identityX.loadActiveContext();

  if (!user || !user.id) return next();
  const idxEncId = findEncryptedId({ externalIds: user.externalIds, brandKey });
  const cookieEncId = olyticsCookie.parseFrom(req);
  if (!idxEncId && cookieEncId && !res.headersSent) {
    // an identity-x user without an encrypted id is logged in.
    // clear any encrypted id cookies if they are set.
    olyticsCookie.clearFrom(res);
    return next();
  }
  // if theres a mismatch between the idx user encrypted id and the
  // cookie id, reset the cookie id.
  if (idxEncId !== cookieEncId && !res.headersSent) {
    olyticsCookie.setTo(res, idxEncId);
  }
  return next();
});
