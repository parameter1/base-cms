const appendBehavior = require('./append-behavior');
const appendDemographic = require('./append-demographic');
const appendPromoCode = require('./append-promo-code');
const behavior = require('./behavior');
const hookBehavior = require('./hook-behavior');
const hookDemographic = require('./hook-demographic');
const hookPromoCode = require('./hook-promo-code');
const shouldAwait = require('./should-await');

module.exports = {
  appendBehavior,
  appendDemographic,
  appendPromoCode,
  behavior,
  hookBehavior,
  hookDemographic,
  hookPromoCode,
  shouldAwait,
};
