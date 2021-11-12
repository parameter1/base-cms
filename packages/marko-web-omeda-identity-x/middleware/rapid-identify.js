const idxRapidIdentify = require('../rapid-identify');

module.exports = ({
  brandKey,
  productId,

  prop = '$idxOmedaRapidIdentify',
  omedaRapidIdentifyProp = '$omedaRapidIdentify',
}) => {
  if (!prop) throw new Error('An Omeda + IdentityX rapid identifcation prop is required.');
  if (!omedaRapidIdentifyProp) throw new Error('The Omeda rapid identifcation prop is required.');

  return (req, res, next) => {
    const rapidIdentify = req[omedaRapidIdentifyProp];
    if (!rapidIdentify) throw new Error(`Unable to find the Omeda rapid identifier on the request using ${omedaRapidIdentifyProp}`);

    const handler = async ({ user } = {}) => idxRapidIdentify({
      brandKey,
      productId,
      appUser: user,

      identityX: req.identityX,
      rapidIdentify,
    });

    req[prop] = handler;
    res.locals[prop] = handler;
    next();
  };
};
