const { cleanEnv, validators } = require('@parameter1/base-cms-env');

const { nonemptystr } = validators;

// @todo This should be removed once contact us is moved to core and the mailer service is created.
module.exports = cleanEnv(process.env, {
  ALGOLIA_API_KEY: nonemptystr({ desc: 'The Algolia API Key.' }),
  ALGOLIA_APP_ID: nonemptystr({ desc: 'The Algolia API ID.' }),
  ALGOLIA_DEFAULT_INDEX: nonemptystr({ desc: 'The Algolia default index.' }),
});
