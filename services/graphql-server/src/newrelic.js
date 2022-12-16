const { stopSampler } = require('@parameter1/base-cms-newrelic');
const { NEW_RELIC_ENABLED } = require('./env');

process.env.NEW_RELIC_ENABLED = NEW_RELIC_ENABLED;

stopSampler();

module.exports = require('newrelic');
