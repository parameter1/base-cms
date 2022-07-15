const { get, getAsArray, getAsObject } = require('@parameter1/base-cms-object-path');

class OmedaIdentityXConfiguration {
  /**
   * @param {object} omedaConfig An object containing the required Omeda configs (credentials/etc)
   * @param {IdentityXConfiguration} idxConfig An instnace of the IdentityX configuration class
   */
  constructor({
    omedaConfig,
    idxConfig,

    // Default promo code and promo cookie name
    omedaPromoCodeCookieName = 'omeda_promo_code',
    omedaPromoCodeDefault,

    // Express middleware pathing
    idxOmedaRapidIdentifyProp = '$idxOmedaRapidIdentify',
    omedaGraphQLClientProp = '$omedaGraphQLClient',
    omedaRapidIdentifyProp = '$omedaRapidIdentify',
  } = {}) {
    this.hookBehaviors = {};
    this.hookDemographics = {};
    this.hookPromoCodes = {};

    if (!omedaConfig) throw new Error('Unable to configure Omeda+IdentityX: No Omeda config was provided.');
    if (!idxConfig) throw new Error('Unable to configure Omeda+IdentityX: No IdentityX config was provided.');

    this.omedaConfig = omedaConfig;
    this.idxConfig = idxConfig;

    this.omedaGraphQLClientProp = omedaGraphQLClientProp;
    this.omedaRapidIdentifyProp = omedaRapidIdentifyProp;
    this.idxOmedaRapidIdentifyProp = idxOmedaRapidIdentifyProp;

    this.omedaPromoCodeCookieName = omedaPromoCodeCookieName;
    this.omedaPromoCodeDefault = omedaPromoCodeDefault;
  }

  validateHook(name) {
    const valid = Object.keys(this.idxConfig.hooks);
    if (!valid.includes(name)) throw new Error(`The IdentityX hook "${name}" is invalid.`);
  }

  // Sets the behavior ID to be sent when the relevant IdentityX hook is fired
  setHookBehavior(name, behaviorId) {
    this.validateHook(name);
    this.hookBehaviors[name] = behaviorId;
  }

  // Sets the demographic data to be sent when the relevant IdentityX hook is fired
  setHookDemographic(name, id, values, writeInValue) {
    this.validateHook(name);
    this.hookDemographics[name] = { id, values, writeInValue };
  }

  // Sets the promo code to be sent when the relevant IdentityX hook is fired
  setHookPromoCode(name, code) {
    this.validateHook(name);
    this.hookPromoCodes[name] = code;
  }

  getBrandKey() {
    return get(this, 'omedaConfig.brandKey', '').trim().toLowerCase();
  }

  get(path, def) {
    return get(this, path, def);
  }

  getAsArray(path) {
    return getAsArray(this, path);
  }

  getAsObject(path) {
    return getAsObject(this, path);
  }
}

module.exports = OmedaIdentityXConfiguration;
