const { get, getAsObject } = require('@parameter1/base-cms-object-path');
const createClient = require('./utils/create-client');
const getActiveContext = require('./api/queries/get-active-context');
const checkContentAccess = require('./api/queries/check-content-access');
const loadUser = require('./api/queries/load-user');
const appUserByExternalIdQuery = require('./api/queries/load-user-by-external-id');
const addExternalUserId = require('./api/mutations/add-external-user-id');
const setCustomAttributes = require('./api/mutations/set-custom-attributes');
const impersonateAppUser = require('./api/mutations/impersonate-app-user');
const sendChangeEmailLinkMutation = require('./api/mutations/send-change-email-link');
const sendLoginLinkMutation = require('./api/mutations/send-login-link');
const createAppUser = require('./api/mutations/create-app-user');
const logoutAppUser = require('./api/mutations/logout-app-user');
const tokenCookie = require('./utils/token-cookie');
const callHooksFor = require('./utils/call-hooks-for');

const isEmpty = (v) => v == null || v === '';
const isFn = (v) => typeof v === 'function';
const IDENTITY_COOKIE_NAME = '__idx_idt';

class IdentityX {
  constructor({
    req,
    res,
    config,
  } = {}) {
    this.req = req;
    this.res = res;
    this.config = config;
    this.setToken(tokenCookie.getFrom(req));
  }

  /**
   * Validates the email address with a user-supplied function, if present.
   * @param {String} email
   * @return {Tuple} [Boolean, String] The validation status and error message (if present)
   */
  async validateEmail(email) {
    const targetFn = get(this, 'config.options.emailValidator');
    const fn = isFn(targetFn) ? targetFn : () => [Boolean(email)];
    return fn({ email, req: this.req });
  }

  /**
   * Loads the current application, user, and team context.
   *
   * @returns {Promise<object>}
   */
  async loadActiveContext({ forceQuery = false } = {}) {
    // Only run the active context query once
    if (!this.activeContextQuery || forceQuery) {
      this.activeContextQuery = this.client.query({ query: getActiveContext });
    }
    const { data = {} } = await this.activeContextQuery;
    const activeContext = data.activeAppContext || {};
    await callHooksFor(this, 'onLoadActiveContext', {
      req: this.req,
      res: this.res,
      activeContext,
    });
    return activeContext;
  }

  /**
   * Returns an IdentityX user record by email address
   */
  async loadAppUserByEmail(email) {
    const { data } = await this.client.query({
      query: loadUser,
      variables: { email },
      fetchPolicy: 'no-cache',
    });
    return data.appUser;
  }

  /**
   * Checks whether the current user can access the given content.
   *
   * @param {object} input
   * @returns {Promise<object>}
   */
  async checkContentAccess(input) {
    const variables = { input };
    const { data = {} } = await this.client.query({ query: checkContentAccess, variables });
    const access = data.checkContentAccess || {};
    access.requiresUserInput = false;

    const requiredFields = this.config.getRequiredServerFields();
    if (access.isLoggedIn && requiredFields.length) {
      // Check if the user requires additonal input.
      const { user, application } = await this.loadActiveContext();

      access.requiresUserInput = user ? requiredFields.some((key) => isEmpty(user[key])) : false;
      if (user && !access.requiresUserInput) {
        access.requiresUserInput = Boolean(user.mustReVerifyProfile);
      }
      if (user && !access.requiresUserInput) {
        // Check if user needs to answer any globally required custom fields.
        const ids = this.config.getActiveCustomFieldIds();
        access.requiresUserInput = user.customSelectFieldAnswers
          .filter(!ids.length ? ({ field }) => ids.includes(field.id) : () => true)
          .some(({ hasAnswered, field }) => field.required && !hasAnswered);
      }

      if (user && !access.requiresUserInput) {
        const { regionalConsentPolicies } = application.organization;
        const matchingPolicies = regionalConsentPolicies.filter((policy) => {
          const countryCodes = policy.countries.map((country) => country.id);
          return countryCodes.includes(user.countryCode);
        });
        const policiesAnswered = user.regionalConsentAnswers
          .reduce((o, answer) => ({ [answer.id]: true }), {});
        const hasRequiredAnswers = matchingPolicies.length
          ? matchingPolicies.every((policy) => policiesAnswered[policy.id])
          : true;
        access.requiresUserInput = !hasRequiredAnswers;
      }
    }
    return access;
  }

  /**
   * Returns the identity id from the request or supplied response.
   *
   * @returns {String}
   */
  getIdentity(res) {
    const id = get(this.req, `cookies.${IDENTITY_COOKIE_NAME}`);
    if (id) return id;
    const sc = res.get('set-cookie');
    if (sc) return get(sc, IDENTITY_COOKIE_NAME);
    return null;
  }

  /**
   * Sets the IdentityX Identity cookie to the response
   */
  setIdentityCookie(id) {
    const options = {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
    };
    this.res.cookie(IDENTITY_COOKIE_NAME, id, options);
  }

  /**
   * @param {Object} o
   * @param {String} o.identifier
   * @param {Object} o.namespace
   *
   * @returns {Promise<Object>}
   */
  async findUserByExternalId({ identifier, namespace }) {
    const apiToken = this.config.getApiToken();
    if (!apiToken) throw new Error('Unable to add external ID: No API token has been configured.');
    const { data } = await this.client.query({
      query: appUserByExternalIdQuery,
      variables: {
        identifier: { value: identifier },
        namespace,
      },
      context: { apiToken },
    });
    return data.appUserByExternalId;
  }

  /**
   *
   * @param {object} params
   * @returns {Promise<object>}
   */
  async addExternalUserId({
    userId,
    identifier = {},
    namespace = {},
  } = {}) {
    const input = { userId, identifier, namespace };
    const apiToken = this.config.getApiToken();
    if (!apiToken) throw new Error('Unable to add external ID: No API token has been configured.');
    const variables = { input };
    const { data } = await this.client.mutate({
      mutation: addExternalUserId,
      variables,
      context: { apiToken },
    });
    return data.addAppUserExternalId;
  }

  /**
   *
   * @param {*} param0
   */
  setToken(token) {
    this.token = token;

    // Re-init the client if the token changed
    this.client = createClient({
      req: this.req,
      token,
      appId: this.config.getAppId(),
      config: this.config,
    });
  }

  async impersonateAppUser({ userId }) {
    const apiToken = this.config.getApiToken();
    if (!apiToken) throw new Error('Unable to add external ID: No API token has been configured.');
    const variables = { input: { id: userId, verify: true } };
    const { data } = await this.client.mutate({
      mutation: impersonateAppUser,
      variables,
      context: { apiToken },
    });
    const { token } = data.impersonateAppUser;
    tokenCookie.setTo(this.res, token.value);
    this.setToken(token);
  }

  async logoutAppUser() {
    const { token } = this;
    const input = { token };
    const variables = { input };
    const user = getAsObject({
      ...(token && await this.client.mutate({ mutation: logoutAppUser, variables })),
    }, 'data.logoutAppUserWithData');
    tokenCookie.removeFrom(this.res);
    await callHooksFor(this, 'onLogout', {
      req: this.req,
      res: this.res,
      user,
    });
    this.token = null;
  }

  /**
   * Creates an AppUser from an email address
   */
  async createAppUser({ email }) {
    const [valid, msg] = await this.validateEmail(email);
    if (!valid) throw new Error(msg || 'The supplied email address cannot be used.');
    const { data } = await this.client.mutate({
      mutation: createAppUser,
      variables: { email },
    });
    return data.createAppUser;
  }

  /**
   * Sets custom key-value data on the user.
   */
  async setAppUserCustomAttributes({ userId, attributes = {}, dispatch = true } = {}) {
    const { data: { updateOwnAppUserCustomAttributes: user } } = await this.client.mutate({
      mutation: setCustomAttributes,
      variables: { input: { id: userId, attributes } },
    });
    if (dispatch) await callHooksFor(this, 'onUserProfileUpdate', { req: this.req, user });
    return user;
  }

  /**
   * Sends a change email link to an existing user
   */
  async sendChangeEmailLink({ email }) {
    const authUrl = `${this.req.protocol}://${this.req.get('host')}${this.config.getEndpointFor('changeEmail')}`;
    await this.client.mutate({
      mutation: sendChangeEmailLinkMutation,
      variables: { input: { email, authUrl, appContextId: this.config.get('appContextId') } },
    });
    await callHooksFor(this, 'onChangeEmailLinkSent', { email });
  }

  /**
   * Sends a login link to an existing user
   */
  async sendLoginLink({
    appUser,
    source,
    redirectTo,
    additionalEventData,
  }) {
    const authUrl = `${this.req.protocol}://${this.req.get('host')}${this.config.getEndpointFor('authenticate')}`;
    await this.client.mutate({
      mutation: sendLoginLinkMutation,
      variables: {
        input: {
          email: appUser.email,
          authUrl,
          appContextId: this.config.get('appContextId'),
          source,
          redirectTo,
        },
      },
    });
    await callHooksFor(this, 'onLoginLinkSent', {
      ...(additionalEventData || {}),
      additionalEventData,
      req: this.req,
      source,
      user: appUser,
    });
  }
}

module.exports = IdentityX;
