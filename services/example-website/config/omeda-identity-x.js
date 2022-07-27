const { get } = require('@parameter1/base-cms-object-path');
const idxConfig = require('./identity-x');
const omedaConfig = require('./omeda');

module.exports = {
  clientKey: omedaConfig.clientKey,
  brandKey: omedaConfig.brandKey,
  appId: omedaConfig.appId,
  inputId: omedaConfig.inputId,
  rapidIdentProductId: get(omedaConfig, 'rapidIdentification.productId'),
  idxConfig,

  /**
   * IdentityX hook customization
   *
   * If present, the specified behavior, demographic, and/or promo code will be used/appended when
   * handling the relevant IdentityX hook event.
   */
  appendBehaviorToHook: [
    {
      hook: 'onLoginLinkSent',
      behaviorId: 6232,
    },
    {
      hook: 'onAuthenticationSuccess',
      behaviorId: 6231,
    },
    {
      hook: 'onUserProfileUpdate',
      behaviorId: 6233,
    },
  ],

  appendDemographicToHook: [
    {
      hook: 'onLoginLinkSent',
      demographicId: 5071302, // SDC Job Title
      valueIds: [5075829], // Corporate Mgmt
    },
    {
      hook: 'onAuthenticationSuccess',
      demographicId: 5071302, // SDC Job Title
      valueIds: [5075833], // Other
      writeInValue: 'CEO',
    },
    {
      hook: 'onUserProfileUpdate',
      demographicId: 5071302,
      valueIds: [5075831], // Logistics Mgmt
    },
  ],

  appendPromoCodeToHook: [
    {
      hook: 'onLoginLinkSent',
      promoCode: 'Parameter1',
    },
    {
      hook: 'onAuthenticationSuccess',
      promoCode: 'P1Verified',
    },
    {
      hook: 'onUserProfileUpdate',
      promoCode: 'P1FullProfile',
    },
  ],
};
