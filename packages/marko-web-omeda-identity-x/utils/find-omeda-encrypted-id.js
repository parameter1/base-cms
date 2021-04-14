const { asArray } = require('@parameter1/base-cms-utils');

module.exports = ({ externalIds = [], brandKey } = {}) => {
  const externalId = asArray(externalIds).find((eid) => {
    const { namespace, identifier } = eid;
    return namespace.provider === 'omeda'
      && namespace.tenant === brandKey.toLowerCase()
      && namespace.type === 'customer'
      && identifier.type === 'encrypted'
      && identifier.value;
  });
  return externalId ? externalId.identifier.value : null;
};
