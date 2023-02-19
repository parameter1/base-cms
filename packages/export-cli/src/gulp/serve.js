const log = require('fancy-log');
const { watch } = require('gulp');
const {
  cyan,
  green,
  red,
} = require('chalk');
const server = require('./server');

module.exports = (cwd, serverFile) => () => {
  if (process.env.GULP_POLLING_ENABLED) log('Falling back to polling to watch files!');
  const watcher = watch(
    ['**/*.js'],
    {
      cwd,
      queue: false,
      ignoreInitial: false,
      ignored: ['node_modules'],
      ...(process.env.GULP_POLLING_ENABLED && {
        // Use polling on windows https://forums.docker.com/t/file-system-watch-does-not-work-with-mounted-volumes/12038/16
        interval: process.env.GULP_POLLING_INTERVAL
          ? parseInt(process.env.GULP_POLLING_INTERVAL, 10) : 1000,
        usePolling: true,
        useFsEvents: false,
      }),
    },
    server(serverFile),
  );
  watcher.on('add', path => log(`File ${green(path)} was ${green('added')}`));
  watcher.on('change', path => log(`File ${green(path)} was ${cyan('changed')}`));
  watcher.on('unlink', path => log(`File ${green(path)} was ${red('removed')}.`));
};
