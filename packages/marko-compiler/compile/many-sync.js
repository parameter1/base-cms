const compile = require('./one-sync');

module.exports = (files = [], {
  force = false,
  debug = false,
  tempFile = false,
  compilerOptions,
} = {}) => {
  files.forEach((file) => {
    compile(file, {
      force,
      debug,
      tempFile,
      compilerOptions,
    });
  });
};
