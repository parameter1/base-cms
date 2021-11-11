const { asArray } = require('@parameter1/base-cms-utils');
const isOmedaNamespace = require('./is-omeda-namespace');

module.exports = ({
  externalIds = [],
  brandKey,
  type,
  idType,
  valueMatcher,
} = {}) => asArray(externalIds.filter(externalId => isOmedaNamespace({
  externalId,
  brandKey,
  type,
  idType,
  valueMatcher,
})));
