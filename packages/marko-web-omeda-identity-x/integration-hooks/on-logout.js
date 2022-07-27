const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');
const olyticsCookie = require('@parameter1/base-cms-marko-web-omeda/olytics/customer-cookie');

module.exports = (params = {}) => {
  const {
    res,
  } = validate(Joi.object({
    res: Joi.object().required(),
  }).unknown(), params);
  olyticsCookie.clearFrom(res);
};
