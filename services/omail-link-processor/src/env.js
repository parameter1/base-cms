const {
  bool,
  cleanEnv,
  num,
  port,
  str,
} = require('@parameter1/base-cms-env');

module.exports = cleanEnv(process.env, {
  GRAPHQL_URI: str({ desc: 'The BaseCMS GraphQL URL.' }),
  EXPOSED_HOST: str({ desc: 'The external host to run on.', default: 'localhost' }),
  EXPOSED_PORT: port({ desc: 'The external port that express is exposed on.', default: 80 }),
  NEW_RELIC_ENABLED: bool({ desc: 'Whether New Relic is enabled.', default: true, devDefault: false }),
  NEW_RELIC_LICENSE_KEY: str({ desc: 'The license key for New Relic.', devDefault: '(unset)' }),
  PORT: port({ desc: 'The internal port that express will run on.', default: 80 }),
  TERMINUS_TIMEOUT: num({ desc: 'Number of milliseconds before forceful exiting.', default: 1000 }),
  TERMINUS_SHUTDOWN_DELAY: num({ desc: 'Number of milliseconds before the HTTP server starts its shutdown.', default: 10000 }),
});
