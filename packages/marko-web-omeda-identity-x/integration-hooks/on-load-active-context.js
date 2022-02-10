const { get } = require('@parameter1/base-cms-object-path');
const olyticsCookie = require('@parameter1/base-cms-marko-web-omeda/olytics/customer-cookie');
const findEncryptedId = require('../external-id/find-encrypted-customer-id');

module.exports = ({
  brandKey,
  activeContext,
  req,
  res,
}) => {
  const user = get(activeContext, 'user');
  if (!user || !user.id) return;
  const idxEncId = findEncryptedId({ externalIds: user.externalIds, brandKey });
  const cookieEncId = olyticsCookie.parseFrom(req);
  if (!idxEncId && cookieEncId && !res.headersSent) {
    // an identity-x user without an encrypted id is logged in.
    // clear any encrypted id cookies if they are set.
    olyticsCookie.clearFrom(res);
    return;
  }
  // if theres a mismatch between the idx user encrypted id and the
  // cookie id, reset the cookie id.
  if (idxEncId !== cookieEncId && !res.headersSent) {
    olyticsCookie.setTo(res, idxEncId);
  }
};
