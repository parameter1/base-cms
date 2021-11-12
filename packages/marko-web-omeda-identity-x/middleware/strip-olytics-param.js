const tokenCookie = require('@parameter1/base-cms-marko-web-identity-x/utils/token-cookie');
const olyticsCookie = require('@parameter1/base-cms-marko-web-omeda/olytics/customer-cookie');

module.exports = () => (req, res, next) => {
  const currentEncId = olyticsCookie.parseFrom(req);
  const idxUserExists = tokenCookie.exists(req);

  const { oly_enc_id: id, ...q } = req.query;
  const incomingEncId = olyticsCookie.clean(id);

  if (idxUserExists && incomingEncId && incomingEncId !== currentEncId) {
    const params = (new URLSearchParams(q)).toString();
    const redirectTo = `${req.path}${params ? `?${params}` : ''}`;
    res.redirect(302, redirectTo);
  } else {
    next();
  }
};
