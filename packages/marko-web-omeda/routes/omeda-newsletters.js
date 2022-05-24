const { Router } = require('express');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const jsonErrorHandler = require('@parameter1/base-cms-marko-web/express/json-error-handler');
const { validateToken } = require('@parameter1/base-cms-marko-web-recaptcha');
const createError = require('http-errors');
const { json } = require('body-parser');
const recaptcha = require('../config/recaptcha');

const { isArray } = Array;

module.exports = (app) => {
  const router = Router();
  router.use(json());

  router.post('/', asyncRoute(async (req, res) => {
    const {
      token,
      email,
      companyName,
      postalCode,
      deploymentTypeIds,
      demographics,
    } = req.body;
    if (!email) throw createError(400, 'An email address is required.');
    if (!token) throw createError(400, 'A verification token is required.');
    await validateToken({ token, secretKey: recaptcha.secretKey });

    const { encryptedCustomerId } = await req.$omedaRapidIdentify({
      email,
      ...(companyName && { companyName }),
      ...(postalCode && { postalCode }),
      ...(isArray(deploymentTypeIds) && deploymentTypeIds.length && { deploymentTypeIds }),
      ...(isArray(demographics) && demographics.length && { demographics }),
    });
    res.json({ encryptedCustomerId });
  }));

  router.use(jsonErrorHandler());
  app.use('/__omeda/newsletter-signup', router);
};
