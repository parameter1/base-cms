const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');
const olyticsCookie = require('@parameter1/base-cms-marko-web-omeda/olytics/customer-cookie');
const findEncryptedId = require('../external-id/find-encrypted-customer-id');
const props = require('../validation/props');

module.exports = async (params = {}) => {
  const {
    brandKey,
    res,
    user,
  } = validate(Joi.object({
    brandKey: props.brandKey.required(),
    user: Joi.object().required(),
    res: Joi.object().required(),
  }).unknown(true), params);
  const encryptedId = findEncryptedId({ externalIds: user.externalIds, brandKey });
  if (!encryptedId) return;
  olyticsCookie.setTo(res, encryptedId);
};
