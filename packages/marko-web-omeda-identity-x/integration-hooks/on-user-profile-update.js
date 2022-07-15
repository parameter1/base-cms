const extractPromoCode = require('../utils/extract-promo-code');

module.exports = async ({
  idxOmedaRapidIdentifyProp = '$idxOmedaRapidIdentify',
  omedaPromoCodeCookieName = 'omeda_promo_code',
  omedaPromoCodeDefault,
  config,
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
  const appendBehavior = config.get('hookBehaviors.onUserProfileUpdate');
  const appendDemographic = config.get('hookDemographics.onUserProfileUpdate');
  const appendPromoCode = config.get('hookPromoCodes.onUserProfileUpdate');

  return idxOmedaRapidIdentify({
    user,
    ...(promoCode && { promoCode }),
    ...(appendBehavior && { appendBehavior }),
    ...(appendDemographic && { appendDemographic }),
    ...(appendPromoCode && { appendPromoCode }),
  });
};
