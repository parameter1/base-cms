const olyticsCookie = require('@parameter1/base-cms-marko-web-omeda/olytics/customer-cookie');
const extractPromoCode = require('../utils/extract-promo-code');
const findEncryptedId = require('../external-id/find-encrypted-customer-id');

module.exports = async ({
  config,
  brandKey,
  promoCode: hookDataPromoCode,
  user,
  res,
}) => {
  const encryptedId = findEncryptedId({ externalIds: user.externalIds, brandKey });
  if (!encryptedId) return;
  olyticsCookie.setTo(res, encryptedId);
  const idxOmedaRapidIdentifyProp = config.get('idxOmedaRapidIdentifyProp');
  const omedaPromoCodeCookieName = config.get('omedaPromoCodeCookieName');
  const omedaPromoCodeDefault = config.get('omedaPromoCodeDefault');
  const idxOmedaRapidIdentify = res[idxOmedaRapidIdentifyProp];
  if (!idxOmedaRapidIdentify) throw new Error(`Unable to find the IdentityX+Omeda rapid identifier on the request using ${idxOmedaRapidIdentifyProp}`);

  const promoCode = extractPromoCode({
    promoCode: hookDataPromoCode,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
    cookies: res.req.cookies,
  });
  const appendBehavior = config.get('hookBehaviors.onUserProfileUpdate');
  const appendDemographic = config.get('hookDemographics.onUserProfileUpdate');
  const appendPromoCode = config.get('hookPromoCodes.onUserProfileUpdate');

  await idxOmedaRapidIdentify({
    user,
    ...(promoCode && { promoCode }),
    ...(appendBehavior && { appendBehavior }),
    ...(appendDemographic && { appendDemographic }),
    ...(appendPromoCode && { appendPromoCode }),
  });
};
