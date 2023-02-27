const isOmedaNamespace = require('./is-omeda-namespace');

module.exports = ({ externalId, brandKey } = {}) => isOmedaNamespace({
  externalId,
  brandKey,
  type: 'deploymentType',
  valueMatcher: (id) => parseInt(id, 10),
});
