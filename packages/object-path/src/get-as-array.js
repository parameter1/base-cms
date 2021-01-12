const { get } = require('object-path');
const { asArray } = require('@parameter1/base-cms-utils');

module.exports = (obj, path) => asArray(get(obj, path, []));
