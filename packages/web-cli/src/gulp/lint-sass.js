const cache = require('gulp-cached');
const pump = require('pump');
const styelint = require('gulp-stylelint');
const { src } = require('gulp');
const completeTask = require('@parameter1/base-cms-cli-utils/task-callback');

module.exports = (cwd, options, ignore = ['**/node_modules/**/*']) => (cb) => {
  pump([
    src('server/styles/**/*.scss', { cwd, ignore }),
    cache('basecms-lint-sass'),
    styelint({
      ...options,
      failAfterError: false,
      reporters: [
        { formatter: 'string', console: true },
      ],
    }),
  ], e => completeTask(e, cb));
};
