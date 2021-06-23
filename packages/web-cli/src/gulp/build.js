const {
  parallel,
  series,
} = require('gulp');
const del = require('del');
const css = require('./css');
const js = require('./js');
const ssr = require('./ssr');
const manifest = require('./manifest');

module.exports = cwd => series(
  () => del('dist/**/*', { cwd }),
  parallel(
    css(cwd),
    series(js(cwd), ssr(cwd)),
  ),
  manifest(cwd),
);
