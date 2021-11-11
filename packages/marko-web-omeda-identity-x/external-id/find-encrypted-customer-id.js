const { asArray } = require('@parameter1/base-cms-utils');
const getEncryptedId = require('./get-encrypted-customer-id');

module.exports = ({ externalIds, brandKey } = {}) => {
  const eid = asArray(externalIds).find(externalId => getEncryptedId({
    externalId,
    brandKey,
  }));
  return eid ? eid.identifier.value : null;
};
