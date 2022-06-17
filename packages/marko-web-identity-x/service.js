const createClient = require('./utils/create-client');
const getActiveContext = require('./api/queries/get-active-context');
const checkContentAccess = require('./api/queries/check-content-access');
const addExternalUserId = require('./api/mutations/add-external-user-id');
const tokenCookie = require('./utils/token-cookie');
const callHooksFor = require('./utils/call-hooks-for');


const isEmpty = v => v == null || v === '';

class IdentityX {
  constructor({
    req,
    res,
    config,
  } = {}) {
    this.req = req;
    this.res = res;
    this.token = tokenCookie.getFrom(req);
    this.config = config;
    this.client = createClient({
      req,
      token: this.token,
      appId: config.getAppId(),
      config,
    });
  }

  /**
   * Loads the current application, user, and team context.
   *
   * @returns {Promise<object>}
   */
  async loadActiveContext() {
    // Require a token/cookie to check active context. This disables team context from IP/CIDR.
    if (!this.activeContextQuery && this.token) {
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

      access.requiresUserInput = user ? requiredFields.some(key => isEmpty(user[key])) : false;
      if (user && !access.requiresUserInput) {
        access.requiresUserInput = Boolean(user.mustReVerifyProfile);
      }
      if (user && !access.requiresUserInput) {
        // Check if user needs to answer any globally required custom fields.
        access.requiresUserInput = user.customSelectFieldAnswers
          .some(({ hasAnswered, field }) => field.required && !hasAnswered);
      }

      if (user && !access.requiresUserInput) {
        const { regionalConsentPolicies } = application.organization;
        const matchingPolicies = regionalConsentPolicies.filter((policy) => {
          const countryCodes = policy.countries.map(country => country.id);
          return countryCodes.includes(user.countryCode);
        });
        const policiesAnswered = user.regionalConsentAnswers
          .reduce((o, answer) => ({ [answer.id]: true }), {});
        const hasRequiredAnswers = matchingPolicies.length
          ? matchingPolicies.every(policy => policiesAnswered[policy.id])
          : true;
        access.requiresUserInput = !hasRequiredAnswers;
      }
    }
    return access;
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
}

module.exports = IdentityX;
