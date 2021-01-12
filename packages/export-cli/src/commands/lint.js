const logCmd = require('@parameter1/base-cms-cli-utils/log-command');
const cwd = require('@parameter1/base-cms-cli-utils/get-cwd');
const lint = require('../gulp/lint');

module.exports = ({ path }) => {
  const dir = cwd(path);
  logCmd('lint', dir);
  lint(dir)();
};
