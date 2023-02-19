const isOmedaNamespace = require('./is-omeda-namespace');

module.exports = ({ externalId, brandKey } = {}) => isOmedaNamespace({
  externalId,
  brandKey,
  type: 'product',
  valueMatcher: (id) => parseInt(id, 10),
});
