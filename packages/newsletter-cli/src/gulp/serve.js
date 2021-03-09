const livereload = require('gulp-livereload');
const log = require('fancy-log');
const { watch, parallel } = require('gulp');
const {
  cyan,
  green,
  magenta,
  red,
} = require('chalk');
const lint = require('./lint');
const server = require('./server');

if (!process.env.LIVERELOAD_PORT) {
  process.env.LIVERELOAD_PORT = 5010;
}
const { LIVERELOAD_PORT } = process.env;

module.exports = (cwd, serverFile) => () => {
  livereload.listen({ port: LIVERELOAD_PORT, quiet: true });
  log(`Livereload ${green('listening')} on port ${magenta(LIVERELOAD_PORT)}`);
  if (process.env.GULP_POLLING_ENABLED) log('Falling back to polling to watch files!');
  const watcher = watch(
    [
      '**/*.js',
      '**/*.json',
      '**/*.css',
      '**/*.marko',
    ],
    {
      cwd,
      queue: false,
      ignoreInitial: false,
      ignored: ['**/*.marko.js', 'node_modules'],
      ...(process.env.GULP_POLLING_ENABLED && {
        // Use polling on windows https://forums.docker.com/t/file-system-watch-does-not-work-with-mounted-volumes/12038/16
        interval: process.env.GULP_POLLING_INTERVAL || 1000,
        usePolling: true,
        useFsEvents: false,
      }),
    },
    parallel(lint(cwd), server(serverFile)),
  );
  watcher.on('add', path => log(`File ${green(path)} was ${green('added')}`));
  watcher.on('change', path => log(`File ${green(path)} was ${cyan('changed')}`));
  watcher.on('unlink', path => log(`File ${green(path)} was ${red('removed')}.`));
};
