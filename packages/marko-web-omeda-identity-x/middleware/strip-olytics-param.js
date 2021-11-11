const tokenCookie = require('@parameter1/base-cms-marko-web-identity-x/utils/token-cookie');
const olyticsCookie = require('@parameter1/base-cms-marko-web-omeda/olytics/customer-cookie');

module.exports = () => (req, res, next) => {
  const currentId = olyticsCookie.parseFrom(req);
  const idxUserExists = tokenCookie.exists(req);

  const { oly_enc_id: id, ...q } = req.query;
  const incomingId = olyticsCookie.clean(id);

  if (idxUserExists && incomingId && incomingId !== currentId) {
    const params = (new URLSearchParams(q)).toString();
    const redirectTo = `${req.path}${params ? `?${params}` : ''}`;
    res.redirect(redirectTo, 302);
  } else {
    next();
  }
};
