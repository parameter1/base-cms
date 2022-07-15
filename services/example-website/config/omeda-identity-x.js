const OmedaIdentityXConfiguration = require('@parameter1/base-cms-marko-web-omeda-identity-x/config');

module.exports = ({ omeda, identityX }) => {
  const oidx = new OmedaIdentityXConfiguration({
    omedaConfig: omeda,
    idxConfig: identityX,
  });

  /**
   * IdentityX hook customization
   *
   * If present, the specified behavior, demographic, and/or promo code will be used/appended when
   * handling the relevant IdentityX hook event.
   */
  oidx.setHookBehavior('onLoginLinkSent', 6);
  oidx.setHookBehavior('onAuthenticationSuccess', 7);
  oidx.setHookBehavior('onUserProfileUpdate', 8);
  // oidx.setHookBehavior('onLoadActiveContext', 0);
  // oidx.setHookBehavior('onLogout', 0);

  // Demographics to apply
  oidx.setHookDemographic('onLoginLinkSent', 1234, [2345]);
  oidx.setHookDemographic('onAuthenticationSuccess', 1234, [2345, 3456]);
  oidx.setHookDemographic('onUserProfileUpdate', 1234, [2345, 3456, 4567]);
  // oidx.setHookDemographic('onLoadActiveContext', 1234, 5678);
  // oidx.setHookDemographic('onLogout', 1234, 6789);

  // Promo codes to apply
  oidx.setHookPromoCode('onLoginLinkSent', 'Parameter1');
  oidx.setHookPromoCode('onAuthenticationSuccess', 'P1Verified');
  oidx.setHookPromoCode('onUserProfileUpdate', 'P1FullProfile');
  // oidx.setHookPromoCode('onLoadActiveContext', 'whatever');
  // oidx.setHookPromoCode('onLogout', 'somethingelse);

  return oidx;
};
