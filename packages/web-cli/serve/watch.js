const path = require('path');
const chokidar = require('chokidar');
const log = require('fancy-log');
const { blue, grey } = require('chalk');
const compile = require('@parameter1/base-cms-marko-compiler/compile');
const { deleteCompiledFor } = require('@parameter1/base-cms-marko-compiler/utils');
const { getProfileMS } = require('@parameter1/base-cms-utils');
const formatWebsiteInfo = require('./format-website-info');

const extensions = [
  '**/*.marko',
  '**/*.js',
  '**/*.json',
];

const ignored = [
  '**/*.marko.js', // compiled marko.js files
  'node_modules', // node_modules
  'dist', // local dist folders
  'browser/**/*.js', // browser js
];

module.exports = async ({
  server,
  cwd,
  additonalDirs = [],
  showFiles,
  rejectOnNonZeroExit = true,
  ignore = [],
} = {}) => {
  const start = process.hrtime();
  log('starting file watcher...');

  const watchGlobs = additonalDirs.reduce((a, dir) => {
    extensions.forEach((ext) => a.push(path.join(dir, ext)));
    return a;
  }, [...extensions]);
  watchGlobs.map((glob) => log(`- ${path.join(cwd, glob)}`));

  const watcher = chokidar.watch(watchGlobs, {
    ignoreInitial: true,
    cwd,
    ignored: [
      /(^|[/\\])\../, // dot files
      ...additonalDirs.reduce((a, dir) => {
        ignored.forEach((ext) => a.push(path.join(dir, ext)));
        return a;
      }, [...ignored]),
      ...ignore,
    ],
  });

  const restart = async () => {
    const s = process.hrtime();
    log('restarting server...');
    const message = await server.restart({ rejectOnNonZeroExit });
    log(`server restarted in ${getProfileMS(s)}ms`);
    log(formatWebsiteInfo(message));
  };

  const handleEvent = async ({ event, file }) => {
    const ext = path.extname(file);
    if (['.js', '.json'].includes(ext) && event === 'change') {
      return restart();
    }
    if (ext === '.marko') {
      if (['change', 'add'].includes(event)) {
        await compile.one(file, { debug: true, force: true });
        return event === 'add' ? null : restart();
      }
      if (event === 'unlink') {
        await deleteCompiledFor(file, { throwOnNotFound: false });
        return null;
      }
    }
    return null;
  };

  watcher.on('all', async (event, filePath) => {
    try {
      const file = path.resolve(cwd, filePath);
      log(`watch event '${blue(event)}' detected in file ${grey(file)}`);
      await handleEvent({ event, file });
    } catch (e) {
      // on error, ensure forked server is killed.
      server.kill();
      throw e;
    }
  });

  await (new Promise((resolve) => {
    watcher.on('ready', resolve);
  }));

  log(`file watcher started in ${getProfileMS(start)}ms`);
  if (showFiles) log(watcher.getWatched());
};
