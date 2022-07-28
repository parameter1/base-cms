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
      demographicId: 5081074, // Email Authorization Status
      valueIds: [5104240], // Submitted
    },
    {
      hook: 'onAuthenticationSuccess',
      demographicId: 5081074,
      valueIds: [5104240, 5104239], // Submitted, Verified
    },
    {
      hook: 'onUserProfileUpdate',
      demographicId: 5081074,
      valueIds: [5104240, 5104239, 5104238], // Submitted, Verified, Full Profile
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
