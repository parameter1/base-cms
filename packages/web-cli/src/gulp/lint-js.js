const cache = require('gulp-cached');
const eslint = require('gulp-eslint');
const pump = require('pump');
const { src } = require('gulp');
const completeTask = require('@parameter1/base-cms-cli-utils/task-callback');

module.exports = (cwd, options, ignore = ['**/node_modules/**/*']) => (cb) => {
  pump([
    src(['server/**/*.js', '!server/**/*.marko.js'], { cwd, ignore }),
    cache('basecms-lint-js'),
    eslint(options),
    eslint.results((results, lintCb) => {
      lintCb();
      cb();
    }),
    eslint.format(),
    eslint.failAfterError(),
  ], e => completeTask(e, cb));
};
