const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const pump = require('pump');
const sass = require('gulp-sass')(require('node-sass'));
const sourcemaps = require('gulp-sourcemaps');
const { dest, src } = require('gulp');
const completeTask = require('@parameter1/base-cms-cli-utils/task-callback');

sass.compiler = require('node-sass');

module.exports = cwd => (cb) => {
  const paths = [...require.main.paths];
  paths.pop();
  pump([
    src('server/styles/index.scss', { cwd }),
    sourcemaps.init(),
    sass({
      includePaths: paths,
    }),
    postcss([
      autoprefixer({
        overrideBrowserslist: [
          'Chrome >= 64',
          'Firefox >= 67',
          'Edge >= 79',
          'iOS >= 12',
          'Safari >= 11.1',
          'Opera >= 51',
        ],
      }),
      cssnano(),
    ]),
    sourcemaps.write('.'),
    dest('dist/css', { cwd }),
  ], e => completeTask(e, cb));
};
