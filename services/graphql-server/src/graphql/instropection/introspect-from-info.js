const introspect = require('./introspect');

module.exports = (info, { shallow = false } = {}) => introspect({
  ...info,
  selectionSet: info.fieldNodes[0].selectionSet,
  shallow,
});
