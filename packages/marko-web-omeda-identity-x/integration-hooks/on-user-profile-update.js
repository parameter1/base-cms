const extractPromoCode = require('../utils/extract-promo-code');

module.exports = async ({
  idxOmedaRapidIdentifyProp = '$idxOmedaRapidIdentify',
  omedaPromoCodeCookieName = 'omeda_promo_code',
  omedaPromoCodeDefault,
  req,
  user,
  promoCode: hookDataPromoCode,
}) => {
  const idxOmedaRapidIdentify = req[idxOmedaRapidIdentifyProp];
  if (!idxOmedaRapidIdentify) throw new Error(`Unable to find the IdentityX+Omeda rapid identifier on the request using ${idxOmedaRapidIdentifyProp}`);
  const promoCode = extractPromoCode({
    promoCode: hookDataPromoCode,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
    cookies: req.cookies,
  });

  return idxOmedaRapidIdentify({
    user,
    ...(promoCode && { promoCode }),
  });
};
