const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');
const olyticsCookie = require('@parameter1/base-cms-marko-web-omeda/olytics/customer-cookie');
const findEncryptedId = require('../external-id/find-encrypted-customer-id');

module.exports = async (params = {}) => {
  const {
    brandKey,
    user,
    res,
  } = validate(Joi.object({
    brandKey: Joi.string().required(),
    user: Joi.object().required(),
    res: Joi.object().required(),
  }).unknown(true), params);
  const encryptedId = findEncryptedId({ externalIds: user.externalIds, brandKey });
  if (!encryptedId) return;
  olyticsCookie.setTo(res, encryptedId);
};
