const { asArray } = require('@parameter1/base-cms-utils');
const getEncryptedId = require('./get-encrypted-customer-id');

module.exports = ({ externalIds, brandKey } = {}) => asArray(externalIds)
  .find(externalId => getEncryptedId({
    externalId,
    brandKey,
  }));
