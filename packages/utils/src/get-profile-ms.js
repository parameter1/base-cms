const round = require('./round');

module.exports = (start, precision = 0) => {
  const [secs, ns] = process.hrtime(start);
  return round((secs * 1000) + (ns / 1000000), precision);
};
