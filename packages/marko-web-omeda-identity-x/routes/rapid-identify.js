const { Router } = require('express');
const { getAsObject } = require('@parameter1/base-cms-object-path');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const jsonErrorHandler = require('@parameter1/base-cms-marko-web/express/json-error-handler');

const tokenCookie = require('@parameter1/base-cms-marko-web-identity-x/utils/token-cookie');
const olyticsCookie = require('@parameter1/base-cms-marko-web-omeda/olytics/customer-cookie');

const findEncryptedId = require('../external-id/find-encrypted-customer-id');
const extractPromoCode = require('../utils/extract-promo-code');

module.exports = ({
  brandKey,
  idxOmedaRapidIdentifyProp = '$idxOmedaRapidIdentify',
  omedaPromoCodeCookieName = 'omeda_promo_code',
  omedaPromoCodeDefault,
} = {}) => {
  if (!brandKey) throw new Error('An Omeda brand key is required to use this middleware.');
  const router = Router();
  router.get('/', asyncRoute(async (req, res) => {
    const idxOmedaRapidIdentify = req[idxOmedaRapidIdentifyProp];
    if (!idxOmedaRapidIdentify) throw new Error(`Unable to find the IdentityX+Omeda rapid identifier on the request using ${idxOmedaRapidIdentifyProp}`);

    const promoCode = extractPromoCode({
      omedaPromoCodeCookieName,
      omedaPromoCodeDefault,
      cookies: req.cookies,
    });

    const data = {
      userId: null,
      encryptedId: null,
      source: null,
      didResetCookie: false,
      brandKey: brandKey.toLowerCase(),
    };
    const idxUserExists = tokenCookie.exists(req);
    if (!idxUserExists) return res.json(data);

    const context = await req.identityX.loadActiveContext();
    const user = getAsObject(context, 'user');
    if (!user.id) return res.json(data);
    data.userId = user.id;

    // determine if an encrypted ID already exists for this user and brand.
    const encryptedId = findEncryptedId({ externalIds: user.externalIds, brandKey });
    if (encryptedId) {
      data.encryptedId = encryptedId;
      data.source = 'existing';
    } else {
      // no omeda identifier found for this user, rapidly identify.
      const { encryptedCustomerId } = await idxOmedaRapidIdentify({ user, promoCode });
      data.encryptedId = encryptedCustomerId;
      data.source = 'new';
    }

    // finally, reset the olytics cookie if it isn't present
    // or doesn't match the current encrypted id.
    const currentEncId = olyticsCookie.parseFrom(req);

    if (!currentEncId || currentEncId !== data.encryptedId) {
      olyticsCookie.setTo(res, data.encryptedId);
      data.didResetCookie = true;
    }
    return res.json(data);
  }));

  router.use(jsonErrorHandler());
  return router;
};
