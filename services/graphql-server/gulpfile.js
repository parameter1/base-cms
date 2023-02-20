const gulpfile = require('../../gulpfile');

gulpfile({
  entry: 'src/index.js',
  watchPaths: [
    'src/**/*.js',
  ],
});
