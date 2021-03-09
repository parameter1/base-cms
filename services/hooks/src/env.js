const { envalid } = require('@parameter1/base-cms-tooling');

const {
  custom,
  cleanEnv,
  bool,
  port,
  str,
} = envalid;
const { nonemptystr } = custom;

module.exports = cleanEnv(process.env, {
  ENABLE_BASEDB_LOGGING: bool({ desc: 'Whether the BaseDB instance should log to the console.', default: false }),
  NEW_RELIC_ENABLED: bool({ desc: 'Whether New Relic is enabled.', default: true, devDefault: false }),
  NEW_RELIC_LICENSE_KEY: nonemptystr({ desc: 'The license key for New Relic.', devDefault: '(unset)' }),
  EXPOSED_HOST: str({ desc: 'The external host to run on.', default: 'localhost' }),
  EXPOSED_PORT: port({ desc: 'The external port to run on.', default: 10012 }),
  CAPRICA_DSN: nonemptystr({ desc: 'The Base Caprica MongoDB connection URL.' }),
  LEONIS_DSN: nonemptystr({ desc: 'The Base Leonis MongoDB connection URL.' }),
  TAURON_DSN: nonemptystr({ desc: 'The Base Tauron MongoDB connection URL.' }),
  VIRGON_DSN: nonemptystr({ desc: 'The Base Tauron MongoDB connection URL.' }),
});
