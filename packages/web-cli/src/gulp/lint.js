const { parallel } = require('gulp');
const lintjs = require('./lint-js');

module.exports = (cwd, { jsopts } = {}) => parallel(
  lintjs(cwd, jsopts),
);
