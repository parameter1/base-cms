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


};
