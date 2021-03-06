const { get, getAsArray, getAsObject } = require('@parameter1/base-cms-object-path');
const { isFunction: isFn } = require('@parameter1/base-cms-utils');

const validHooks = ['onAuthenticationSuccess', 'onUserProfileUpdate'];

class IdentityXConfiguration {
  /**
   *
   * @param {object} options
   * @param {string} options.appId The application ID to use.
   * @param {string} [options.apiToken] An API token to use. Only required when doing write ops.
   * @param {string[]} [options.requiredServerFields] Required fields, server enforced.
   * @param {string[]} [options.requiredClientFields] Required fields, client-side only.
   */
  constructor({
    appId,
    apiToken,
    requiredServerFields = [],
    requiredClientFields = [],
    ...rest
  } = {}) {
    if (!appId) throw new Error('Unable to configure IdentityX: no Application ID was provided.');
    this.appId = appId;
    this.apiToken = apiToken;
    this.options = {
      requiredServerFields,
      requiredClientFields,
      ...rest,
    };

    this.endpointTypes = ['authenticate', 'login', 'logout', 'register', 'profile'];
    this.hooks = validHooks.reduce((o, name) => ({ ...o, [name]: [] }), {});
  }

  /**
   * Adds a function to the hook queue.
   *
   * @param {object} params
   * @param {string} params.string The hook name to register the function with.
   * @param {function} params.fn The function to call. Can be async/promise.
   * @param {boolean} [params.shouldAwait=false] Whether the function should be awaited.
   */
  addHook({ name, fn, shouldAwait = false } = {}) {
    if (!validHooks.includes(name)) throw new Error(`No hook found for '${name}'`);
    if (!isFn(fn)) throw new Error('The hook `fn` must be a function.');
    this.hooks[name].push({ fn, shouldAwait });
    return this;
  }

  getAppId() {
    return this.appId;
  }

  getApiToken() {
    return this.apiToken;
  }

  getEndpointFor(type) {
    return this.get(`endpoints.${type}`, `/user/${type}`);
  }

  getEndpoints() {
    return this.endpointTypes.reduce((o, type) => {
      const endpoint = this.getEndpointFor(type);
      return { ...o, [type]: endpoint };
    }, {});
  }

  getRequiredServerFields() {
    return this.getAsArray('requiredServerFields');
  }

  getRequiredClientFields() {
    return this.getAsArray('requiredClientFields');
  }

  get(path, def) {
    return get(this.options, path, def);
  }

  getAsArray(path) {
    return getAsArray(this.options, path);
  }

  getAsObject(path) {
    return getAsObject(this.options, path);
  }
}

module.exports = IdentityXConfiguration;
