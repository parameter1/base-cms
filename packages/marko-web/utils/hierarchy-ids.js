const { getAsArray } = require('@parameter1/base-cms-object-path');

module.exports = section => getAsArray(section, 'hierarchy').map(s => s.id).reverse();
