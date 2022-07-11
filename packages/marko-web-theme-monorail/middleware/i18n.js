const { set } = require('@parameter1/base-cms-object-path');

const isFn = f => typeof f === 'function';

/**
 * Installs the configured translation function in the Express app instance
 */
module.exports = (app, fn) => {
  const defaultFn = v => v;
  const i18n = isFn(fn) ? fn : defaultFn;
  set(app.locals, 'i18n', i18n);
};
