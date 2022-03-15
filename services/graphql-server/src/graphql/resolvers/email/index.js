const deepAssign = require('deep-assign');

const campaign = require('./campaign');
const newsletter = require('./newsletter');
const schedule = require('./schedule');

module.exports = deepAssign(
  campaign,
  newsletter,
  schedule,
);
