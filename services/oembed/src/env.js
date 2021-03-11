const { envalid } = require('@parameter1/base-cms-tooling');

const {
  custom,
  cleanEnv,
  bool,
  num,
  port,
  str,
} = envalid;
const { nonemptystr } = custom;

module.exports = cleanEnv(process.env, {
  EMBEDLY_API_KEY: nonemptystr({ desc: 'The Embed.ly API key..' }),
  NEW_RELIC_ENABLED: bool({ desc: 'Whether New Relic is enabled.', default: true, devDefault: false }),
  NEW_RELIC_LICENSE_KEY: nonemptystr({ desc: 'The license key for New Relic.', devDefault: '(unset)' }),
  EXPOSED_HOST: str({ desc: 'The external host to run on.', default: 'localhost' }),
  EXPOSED_PORT: port({ desc: 'The external port to run on.', default: 10013 }),
  TERMINUS_TIMEOUT: num({ desc: 'Number of milliseconds before forceful exiting', default: 1000 }),
  TERMINUS_SHUTDOWN_DELAY: num({ desc: 'Number of milliseconds before the HTTP server starts its shutdown', default: 10000 }),
});
