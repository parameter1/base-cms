const compile = require('./one');

module.exports = async (files = [], {
  force = false,
  debug = false,
  tempFile = false,
  compilerOptions,
} = {}) => {
  await Promise.all(files.map((file) => compile(file, {
    force,
    debug,
    tempFile,
    compilerOptions,
  })));
};
