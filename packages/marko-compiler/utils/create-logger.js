const log = require('fancy-log');

module.exports = ({ debug }) => (...args) => {
  if (debug) log(...args);
};
