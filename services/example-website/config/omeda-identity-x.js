const OmedaIdentityXConfiguration = require('@parameter1/base-cms-marko-web-omeda-identity-x/config');

module.exports = ({ omeda, identityX }) => {
  const oidx = new OmedaIdentityXConfiguration({
    omedaConfig: omeda,
    idxConfig: identityX,
  });

  return oidx;
};
