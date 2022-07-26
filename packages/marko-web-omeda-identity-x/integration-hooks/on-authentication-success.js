
const olyticsCookie = require('@parameter1/base-cms-marko-web-omeda/olytics/customer-cookie');
const extractPromoCode = require('../utils/extract-promo-code');
const findEncryptedId = require('../external-id/find-encrypted-customer-id');

module.exports = async ({
  brandKey,
  promoCode: hookDataPromoCode,
  idxOmedaRapidIdentifyProp,
  omedaPromoCodeCookieName,
  omedaPromoCodeDefault,
  user,
  req,
  res,
}) => {
  const encryptedId = findEncryptedId({ externalIds: user.externalIds, brandKey });
  if (!encryptedId) return;
  olyticsCookie.setTo(res, encryptedId);
  const idxOmedaRapidIdentify = req[idxOmedaRapidIdentifyProp];
  if (!idxOmedaRapidIdentify) throw new Error(`Unable to find the IdentityX+Omeda rapid identifier on the request using ${idxOmedaRapidIdentifyProp}`);

  const promoCode = extractPromoCode({
    promoCode: hookDataPromoCode,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
    cookies: res.req.cookies,
  });
  // const appendBehavior = config.get('hookBehaviors.onAuthenticationSuccess');
  // const appendDemographic = config.get('hookDemographics.onAuthenticationSuccess');
  // const appendPromoCode = config.get('hookPromoCodes.onAuthenticationSuccess');

  await idxOmedaRapidIdentify({
    user,
    ...(promoCode && { promoCode }),
    // ...(appendBehavior && { appendBehavior }),
    // ...(appendDemographic && { appendDemographic }),
    // ...(appendPromoCode && { appendPromoCode }),
  });
};
