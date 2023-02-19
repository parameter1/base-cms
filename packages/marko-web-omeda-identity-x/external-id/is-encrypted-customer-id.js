const olyticsCookie = require('@parameter1/base-cms-marko-web-omeda/olytics/customer-cookie');
const isOmedaNamespace = require('./is-omeda-namespace');

module.exports = ({ externalId, brandKey } = {}) => isOmedaNamespace({
  externalId,
  brandKey,
  type: 'customer',
  idType: 'encrypted',
  valueMatcher: (id) => olyticsCookie.clean(id),
});
