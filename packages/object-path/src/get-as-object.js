const { get } = require('object-path');
const { asObject } = require('@parameter1/base-cms-utils');

module.exports = (obj, path) => asObject(get(obj, path, {}));
