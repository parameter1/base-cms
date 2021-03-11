const { dasherize } = require('@parameter1/base-cms-inflector');
const entity = require('./base-entity');

module.exports = (id, type) => entity(id, `content-${dasherize(type)}`);
