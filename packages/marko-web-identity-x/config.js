const { get, getAsArray, getAsObject } = require('@parameter1/base-cms-object-path');
const { isFunction: isFn } = require('@parameter1/base-cms-utils');
const validHooks = require('./hooks');

const { log } = console;

class IdentityXConfiguration {
  /**
   *
   * @param {object} options
   * @param {string} options.appId The application ID to use.
   * @param {string} [options.apiToken] An API token to use. Only required when doing write ops.
   * @param {string[]} [options.requiredServerFields] Required fields, server enforced.
   * @param {string[]} [options.requiredClientFields] Required fields, client-side only.
   * @param {string[]} [options.requiredCreateFields] Required fields, when creating a new user.
   * @param {string[]} [options.activeCustomFieldIds] Limit displayed custom fields, if present.
   * @param {string[]} [options.hiddenFields] The fields to hide from the profile.
   * @param {function} [options.onHookError]
   * @param {object} options.rest
   */
  constructor({
    appId,
    apiToken,
    requiredServerFields = [],
    requiredClientFields = [],
    requiredCreateFields = [],
    activeCustomFieldIds = [],
    defaultFieldLabels = {},
    hiddenFields = ['city', 'street', 'addressExtra', 'phoneNumber', 'mobileNumber'],
    defaultCountryCode,
    booleanQuestionsLabel,
    gtmUserFields = {},
    onHookError,
    ...rest
  } = {}) {
    if (!appId) throw new Error('Unable to configure IdentityX: no Application ID was provided.');
    this.appId = appId;
    this.apiToken = apiToken;
    this.options = {
      enableChangeEmail: false,
      requiredServerFields,
      requiredClientFields,
      requiredCreateFields,
      activeCustomFieldIds,
      defaultFieldLabels,
      hiddenFields,
      defaultCountryCode,
      booleanQuestionsLabel,
      gtmUserFields,
      onHookError: (e) => {
        if (process.env.NODE_ENV === 'development') {
          log('ERROR IN IDENTITY-X HOOK', e);
          if (e.networkError) log('Network Error', get(e, 'networkError.result.errors.0'));
        }
        if (isFn(onHookError)) onHookError(e);
      },
      ...rest,
    };

    this.endpointTypes = [
      'authenticate',
      'changeEmail',
      'login',
      'logout',
      'register',
      'profile',
    ];
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

  commentsEnabled() {
    return this.get('comments.enabled', true);
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

  getGTMUserData(user) {
    if (!user) return {};
    const questions = this.getAsObject('gtmUserFields');
    const userData = { id: user.id };
    Object.entries(questions).forEach(([key, value]) => {
      const select = getAsArray(user, 'customSelectFieldAnswers').find(({ id }) => id === value);
      if (select && select.answers.length) userData[key] = select.answers.map(({ label }) => label).join('|');
      const boolean = getAsArray(user, 'customBooleanFieldAnswers').find(({ id }) => id === value);
      if (boolean && boolean.hasAnswered) userData[key] = boolean.answer;
    });
    return userData;
  }

  getRequiredClientFields() {
    return this.getAsArray('requiredClientFields');
  }

  getRequiredCreateFields() {
    return this.getAsArray('requiredCreateFields');
  }

  getHiddenFields() {
    return this.getAsArray('hiddenFields');
  }

  getActiveCustomFieldIds() {
    return this.getAsArray('activeCustomFieldIds');
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
