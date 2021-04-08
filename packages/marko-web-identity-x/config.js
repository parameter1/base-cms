const { get, getAsArray, getAsObject } = require('@parameter1/base-cms-object-path');
const { isFunction: isFn } = require('@parameter1/base-cms-utils');

const validHooks = ['onAuthenticationSuccess'];

class IdentityXConfiguration {
  /**
   *
   * @param {object|string} options When a string, assumes an `appId`, else options object.
   * @param {array} [options.requiredServerFields] Required fields, server enforced.
   * @param {array} [options.requiredClientFields] Required fields, client-side only.
   */
  constructor(options) {
    // BC check for when the constructor only had a single `appId` argument.
    const appId = typeof options === 'string' ? options : get(options, 'appId');
    if (!appId) throw new Error('Unable to configure IdentityX: no Application ID was provided.');
    this.appId = appId;
    this.options = options && typeof options === 'object' ? options : {};

    this.endpointTypes = ['authenticate', 'login', 'logout', 'register', 'profile'];
    this.hooks = {
      onAuthenticationSuccess: [],
    };
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
