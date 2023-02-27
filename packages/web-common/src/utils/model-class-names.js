const { dasherize } = require('@parameter1/base-cms-inflector');

module.exports = (modelName, path) => {
  const parts = String(path).split('.');
  const name = dasherize(modelName);
  const classes = [`${name}-field`, `${name}-field--${parts.map((p) => dasherize(p)).join('-')}`];
  return classes;
};
