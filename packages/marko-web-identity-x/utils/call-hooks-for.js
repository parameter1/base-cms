const { getAsArray } = require('@parameter1/base-cms-object-path');
const { isFunction: isFn } = require('@parameter1/base-cms-utils');

/**
 * Calls all registered hooks for the provided hook queue name.
 *
 * @param {IdentityX} service The IdentityX service instance.
 * @param {string} name The hook queue name
 * @param {object} params Parameters to send to the hook function
 */
module.exports = async (service, name, params = {}) => {
  const { error } = console;
  const onError = service.config.get('onHookError');
  const onHookError = isFn(onError) ? onError : e => error(e);
  const promises = { wait: [], skip: [] };
  getAsArray(service, `config.hooks.${name}`).forEach(({ fn, shouldAwait }) => {
    const key = shouldAwait ? 'wait' : 'skip';
    const maybePromise = fn({ ...params, service });
    if (maybePromise.catch) maybePromise.catch(onHookError);
    promises[key].push(maybePromise);
  });
  if (promises.wait.length) await Promise.all(promises.wait).catch(onHookError);
};
