const { Router } = require('express');
const { getAsObject } = require('@parameter1/base-cms-object-path');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const jsonErrorHandler = require('@parameter1/base-cms-marko-web/express/json-error-handler');
const omedaRapidIdentityX = require('../rapid-identify');
const findOmedaEncryptedId = require('../utils/find-omeda-encrypted-id');

module.exports = ({ brandKey, productId } = {}) => {
  if (!brandKey) throw new Error('An Omeda brand key is required to use this middleware.');
  if (!productId) throw new Error('An Omeda rapid identification product ID is required to use this middleware.');
  const router = Router();
  router.get('/', asyncRoute(async (req, res) => {
    const data = { encryptedId: null, source: null };
    const { identityX } = req;
    const context = await identityX.loadActiveContext();
    const user = getAsObject(context, 'user');
    if (!user.id) return res.json(data);
    // determine if an encrypted ID already exists for this user and brand.
    const encryptedId = findOmedaEncryptedId({ externalIds: user.externalIds, brandKey });
    if (encryptedId) {
      data.encryptedId = encryptedId;
      data.source = 'existing';
    } else {
      // no omeda identifier found for this user, rapidly identify.
      const { encryptedCustomerId } = await omedaRapidIdentityX({
        brandKey,
        productId,
        appUser: user,
        identityX,
        omedaGraphQL: req.$omeda,
      });
      data.encryptedId = encryptedCustomerId;
      data.source = 'new';
    }
    return res.json(data);
  }));

  router.use(jsonErrorHandler());
  return router;
};
