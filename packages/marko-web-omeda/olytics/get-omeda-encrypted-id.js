const omedaCookie = require('./customer-cookie');

module.exports = (req) => {
  const cookieId = omedaCookie.parseFrom(req);
  const incomingId = omedaCookie.clean(req.query.oly_enc_id);
  return incomingId || cookieId;
};
