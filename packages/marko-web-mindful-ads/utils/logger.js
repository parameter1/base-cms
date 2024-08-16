const { log } = console;

module.exports = (debug = false, key = 'mindful') => (...args) => {
  if (debug) log(key, ...args);
};
