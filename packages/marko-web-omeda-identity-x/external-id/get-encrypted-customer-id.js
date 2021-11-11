const olyticsCookie = require('@parameter1/base-cms-marko-web-omeda/olytics/customer-cookie');
const isEncryptedId = require('./is-encrypted-customer-id');

module.exports = ({ externalId, brandKey } = {}) => {
  if (!isEncryptedId({ externalId, brandKey })) return null;
  return olyticsCookie.clean(externalId.identifier.value);
};
