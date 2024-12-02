const { get, getAsObject } = require('@parameter1/base-cms-object-path');
const { getResponseCookies } = require('@parameter1/base-cms-utils');
const createClient = require('./utils/create-client');
const getActiveContext = require('./api/queries/get-active-context');
const checkContentAccess = require('./api/queries/check-content-access');
const loadUser = require('./api/queries/load-user');
const appUserByExternalIdQuery = require('./api/queries/load-user-by-external-id');
const appUserByIdQuery = require('./api/queries/load-user-by-id');
const addExternalUserId = require('./api/mutations/add-external-user-id');
const setCustomAttributes = require('./api/mutations/set-custom-attributes');
const impersonateAppUser = require('./api/mutations/impersonate-app-user');
const sendChangeEmailLinkMutation = require('./api/mutations/send-change-email-link');
const sendLoginLinkMutation = require('./api/mutations/send-login-link');
const createAppUser = require('./api/mutations/create-app-user');
const logoutAppUser = require('./api/mutations/logout-app-user');
const deleteAppUserForCurrentApplicationMutation = require('./api/mutations/delete-app-user-for-current-application');
const tokenCookie = require('./utils/token-cookie');
const callHooksFor = require('./utils/call-hooks-for');

const isEmpty = (v) => v == null || v === '';
const isFn = (v) => typeof v === 'function';
const IDENTITY_COOKIE_NAME = '__idx_idt';

/**
 * @typedef ActiveContext
 * @prop {Application} application
 * @prop {Boolean} hasUser
 * @prop {User} user
 * @prop {Boolean} hasTeams
 * @prop {Team[]} mergedTeams
 * @prop {AccessLevel[]} mergedAccessLevels
 *
 * @typedef Application
 * @prop {String} id
 * @prop {String} name
 * @prop {Object} organization
 *
 * @typedef User
 * @prop {String} id
 * @prop {String} email
 * @prop {Boolean} verified
 * @prop {Number} verifiedCount
 * @prop {String} givenName
 * @prop {String} familyName
 * @prop {String} displayName
 * @prop {String} organization
 * @prop {String} organizationTitle
 * @prop {String} countryCode
 * @prop {String} regionCode
 * @prop {String} postalCode
 * @prop {String} city
 * @prop {String} street
 * @prop {String} addressExtra
 * @prop {String} mobileNumber
 * @prop {String} phoneNumber
 * @prop {Boolean} receiveEmail
 * @prop {Boolean} mustReVerifyProfile
 * @prop {ExternalId[]} externalIds
 * @prop {Object} customAttributes
 * @prop {RegionalConsentAnswer[]} regionalConsentAnswers
 * @prop {CustomBooleanFieldAnswer[]} customBooleanFieldAnswers
 * @prop {CustomSelectFieldAnswer[]} customSelectFieldAnswers
 * @prop {CustomTextFieldAnswer[]} customTextFieldAnswers
 *
 * @typedef ExternalId
 * @prop {String} id
 * @prop {ExternalIdIdentifier} identifier
 * @prop {ExternalIdNamespace} namespace
 *
 * @typedef ExternalIdIdentifier
 * @prop {String} value
 * @prop {String} type
 *
 * @typedef ExternalIdNamespace
 * @prop {String} provider
 * @prop {String} tenant
 * @prop {String} typedef
 *
 * @typedef RegionalConsentAnswer
 * @prop {String} id
 * @prop {Boolean} given
 * @prop {Date} date
 *
 * @typedef CustomBooleanFieldAnswer
 * @prop {String} id
 * @prop {Boolean} hasAnswered
 * @prop {BooleanFieldAnswer} answer
 * @prop {BooleanField} field
 *
 * @typedef CustomSelectFieldAnswer
 * @prop {String} id
 * @prop {Boolean} hasAnswered
 * @prop {SelectFieldAnswer[]} answers
 * @prop {SelectField} field
 *
 * @typedef SelectField
 * @typedef SelectFieldAnswer
 * @typedef BooleanField
 * @typedef BooleanFieldAnswer
 *
 * @typedef Team
 * @prop {String} id
 * @prop {String} name
 * @prop {String} photoURL
 *
 * @typedef AccessLevel
 * @prop {String} id
 * @prop {String} name
 */

class IdentityX {
  /**
   * @param {Object} o
   * @param {import('express').Request} o.req
   * @param {import('express').Response} o.res
   * @param {import('./config')} o.config
   */
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
   * @returns {[Boolean, String]} The validation status and error message (if present)
   */
  async validateEmail(email) {
    const targetFn = get(this, 'config.options.emailValidator');
    const fn = isFn(targetFn) ? targetFn : () => [Boolean(email)];
    return fn({ email, req: this.req });
  }

  /**
   * Loads the current application, user, and team context.
   *
   * @returns {Promise<ActiveContext>}
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
   * @param {import('express').Response} res
   * @returns {String}
   */
  getIdentity(res) {
    const id = get(this.req, `cookies.${IDENTITY_COOKIE_NAME}`);
    if (id) return id;
    const { [IDENTITY_COOKIE_NAME]: resid } = getResponseCookies(res || this.res);
    return resid;
  }

  /**
   * Returns GTM formatted data for the current identity/user
   * @returns {Object}
   */
  async getIdentityData() {
    const context = await this.loadActiveContext();
    if (context.user) return this.getGTMUserData(context.user, 'authenticated');
    const identity = this.getIdentity(this.res);
    if (identity) {
      const user = await this.findUserById(identity);
      if (user) return this.getGTMUserData(user, 'identified');
    }
    return this.getGTMUserData({}, 'anonymous');
  }

  /**
   * Formats user data for use with GTM
   *
   * @param {User} user
   * @returns {Object}
   */
  getGTMUserData(user, state = 'anonymous') {
    return {
      ...this.config.getGTMUserData(user),
      state,
    };
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
   * @param {ExternalIdNamespace} o.namespace
   *
   * @returns {Promise<User|null>}
   */
  async findUserByExternalId({ identifier, namespace }) {
    const apiToken = this.config.getApiToken();
    if (!apiToken) throw new Error('Unable to look up user: No API token has been configured.');
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
   * @param {String} id The user id
   *
   * @returns {Promise<User|null>}
   */
  async findUserById(id) {
    const apiToken = this.config.getApiToken();
    if (!apiToken) throw new Error('Unable to retrieve identity: No API token has been configured.');
    const { data } = await this.client.query({
      query: appUserByIdQuery,
      variables: { id },
      context: { apiToken },
    });
    return data.appUserById;
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
   * @typedef GenerateEntityIdArgs
   * @prop {?string} appId The application id to generate for
   * @prop {?string} userId The user id to genereate for
   *
   * @param {GenerateEntityIdArgs} args
   * @returns {?string} The entityId of the active user/identity, if present.
   */
  async generateEntityId({ appId, userId } = {}) {
    const activeContext = await this.loadActiveContext();
    const applicationId = appId || activeContext.application.id;
    const activeUserId = (activeContext && activeContext.user)
      ? activeContext.user.id : await this.getIdentity();
    const uid = userId || activeUserId;
    return `identity-x.${applicationId}.app-user*${uid}`;
  }

  /**
   * Sends a login link to an existing user
   */
  async sendLoginLink({
    appUser,
    authUrl,
    source,
    redirectTo,
    additionalEventData,
  }) {
    await this.client.mutate({
      mutation: sendLoginLinkMutation,
      variables: {
        input: {
          email: appUser.email,
          authUrl: authUrl || `${this.req.protocol}://${this.req.get('host')}${this.config.getEndpointFor('authenticate')}`,
          appContextId: this.config.get('appContextId'),
          source,
          redirectTo,
          additionalContext: additionalEventData,
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

  /**
   * Delete the user record for the current application using the provided email or id
   */
  async deleteAppUserForCurrentApplication({
    email,
    userId,
  }) {
    const apiToken = this.config.getApiToken();
    if (!apiToken) throw new Error('Unable to delete user: No API token has been configured.');
    const { data } = await this.client.mutate({
      mutation: deleteAppUserForCurrentApplicationMutation,
      variables: {
        input: {
          ...(email && { email }),
          ...(userId && { userId }),
        },
      },
      context: { apiToken },
    });
    return data.deleteAppUserForCurrentApplication;
  }
}

module.exports = IdentityX;
