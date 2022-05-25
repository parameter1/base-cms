const { cleanEnv, validators } = require('@parameter1/base-cms-env');

const { nonemptystr } = validators;

module.exports = cleanEnv(process.env, {
  RECAPTCHA_V3_SITE_KEY: nonemptystr({ desc: 'The Recaptcha Site key.' }),
  RECAPTCHA_V3_SECRET_KEY: nonemptystr({ desc: 'The Recaptcha secret key.' }),
  SENDGRID_API_KEY: nonemptystr({ desc: 'An API key for sending email via SendGrid.' }),
});
