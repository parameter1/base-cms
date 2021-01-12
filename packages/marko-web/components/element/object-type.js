const { dasherize } = require('@parameter1/base-cms-inflector');

module.exports = (type, def = 'obj') => {
  if (!type) return def;
  const inflected = dasherize(type);
  if (inflected === 'content-page') return 'dynamic-page';
  if (/^content-/.test(inflected)) return inflected.replace(/^content-.*/, 'content');
  return inflected;
};
