const { get, set } = require('@parameter1/base-cms-object-path');

const isFn = (f) => typeof f === 'function';
const defaultFn = ({ content }) => get(content, 'userRegistration.isCurrentlyRequired', false);

/**
 * Installs the configured content gating handler in the Express app instance.
 * If not customized, content only be gated when set as gated in the CMS.
 */
module.exports = (app, enabled = true, fn) => { // eslint-disable-line
  const contentGatingHandler = enabled && isFn(fn) ? fn : defaultFn;
  set(app.locals, 'contentGatingHandler', contentGatingHandler);
};
