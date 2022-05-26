const { cleanEnv, validators } = require('@parameter1/base-cms-env');

const { nonemptystr } = validators;

module.exports = cleanEnv(process.env, {
  // these are the google recaptcha test keys
  RECAPTCHA_V3_SITE_KEY: nonemptystr({ desc: 'An site key for sending recaptcha validation.' }),
  RECAPTCHA_V3_SECRET_KEY: nonemptystr({ desc: 'A secret key for sending recaptcha validation.' }),
});
