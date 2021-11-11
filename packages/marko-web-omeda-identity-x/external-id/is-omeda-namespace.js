const { isFunction: isFn } = require('@parameter1/base-cms-utils');

module.exports = ({
  externalId,
  brandKey,
  type,
  idType,
  valueMatcher,
} = {}) => {
  if (!externalId) return false;
  const { namespace, identifier } = externalId;
  return namespace.provider === 'omeda'
    && namespace.tenant === brandKey.toLowerCase()
    && (type ? namespace.type === type : true)
    && identifier.value
    && (idType ? identifier.type === idType : true)
    && (isFn(valueMatcher) ? valueMatcher(identifier.value) : true);
};
