const findFiles = require('../utils/find-files');
const compileMany = require('./many');

module.exports = async (cwd, {
  dirs = [],
  force,
  debug,
  compilerOptions,
}) => {
  const entries = await findFiles(cwd, { dirs, compiled: false });
  await compileMany(entries.map(({ path }) => path), {
    force,
    debug,
    compilerOptions,
  });
};
