const fetch = require('node-fetch');
const { isFunction } = require('@parameter1/base-cms-utils');
const olyticsCookie = require('../olytics/customer-cookie');

module.exports = ({ brandKey, onError } = {}) => (req, _, next) => {
  const currentEncId = olyticsCookie.parseFrom(req);
  const { oly_enc_id: id } = req.query;
  const incomingEncId = olyticsCookie.clean(id);

  const encryptedId = incomingEncId && incomingEncId !== currentEncId
    ? incomingEncId
    : currentEncId;
  if (!encryptedId) return next();

  const payload = { brandKey, id: encryptedId };
  const url = 'https://wjwcgfmala.execute-api.us-east-2.amazonaws.com/default/odentity-enqueue-customer';

  (async () => {
    const res = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || res.statusText);
    return json;
  })().catch((e) => {
    if (isFunction(onError)) onError(e);
    if (process.env.NODE_ENV === 'development') {
      process.emitWarning(`Error in odentity customer upsert: ${e.message}`);
    }
  });
  return next();
};
