const { dasherize } = require('@parameter1/base-cms-inflector');
const ns = require('./create-namespace');

module.exports = (id, type) => `${ns(dasherize(type))}*${id}`;
