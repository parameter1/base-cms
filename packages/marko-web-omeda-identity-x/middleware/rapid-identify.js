const idxOmedaRapidIdentify = require('../rapid-identify');
const extractPromoCode = require('../utils/extract-promo-code');

module.exports = ({
  brandKey,
  productId,

  prop = '$idxOmedaRapidIdentify',
  omedaRapidIdentifyProp = '$omedaRapidIdentify',
  omedaPromoCodeCookieName = 'omeda_promo_code',
  omedaPromoCodeDefault,
}) => {
  if (!prop) throw new Error('An Omeda + IdentityX rapid identifcation prop is required.');
  if (!omedaRapidIdentifyProp) throw new Error('The Omeda rapid identifcation prop is required.');

  return (req, res, next) => {
    const omedaRapidIdentify = req[omedaRapidIdentifyProp];
    if (!omedaRapidIdentify) throw new Error(`Unable to find the Omeda rapid identifier on the request using ${omedaRapidIdentifyProp}`);

    const handler = async ({
      user,
      promoCode,
      appendBehaviors,
      appendDemographics,
      appendPromoCodes,
      behavior,
    } = {}) => idxOmedaRapidIdentify({
      brandKey,
      productId,
      appUser: user,
      promoCode: extractPromoCode({
        promoCode,
        omedaPromoCodeCookieName,
        omedaPromoCodeDefault,
        cookies: req.cookies,
      }),

      // Custom behaviors, demos, or codes to append to the API call
      appendBehaviors,
      appendDemographics,
      appendPromoCodes,

      // The pre-configured behavior/attribute definitions.
      behavior,

      identityX: req.identityX,
      omedaRapidIdentify,
    });

    req[prop] = handler;
    res.locals[prop] = handler;
    next();
  };
};
