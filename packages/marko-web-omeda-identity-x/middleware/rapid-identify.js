const idxOmedaRapidIdentify = require('../rapid-identify');

module.exports = ({
  brandKey,
  productId,

  prop = '$idxOmedaRapidIdentify',
  omedaRapidIdentifyProp = '$omedaRapidIdentify',
}) => {
  if (!prop) throw new Error('An Omeda + IdentityX rapid identifcation prop is required.');
  if (!omedaRapidIdentifyProp) throw new Error('The Omeda rapid identifcation prop is required.');

  return (req, res, next) => {
    const omedaRapidIdentify = req[omedaRapidIdentifyProp];
    if (!omedaRapidIdentify) throw new Error(`Unable to find the Omeda rapid identifier on the request using ${omedaRapidIdentifyProp}`);

    const handler = async ({ user } = {}) => idxOmedaRapidIdentify({
      brandKey,
      productId,
      appUser: user,

      identityX: req.identityX,
      omedaRapidIdentify,
    });

    req[prop] = handler;
    res.locals[prop] = handler;
    next();
  };
};
