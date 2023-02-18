const { getProfileMS } = require('@parameter1/base-cms-marko-web-modern-utils');
const log = require('fancy-log');
const ForkServer = require('./fork-server');
const compileMarkoFiles = require('./compile-marko-files');
const watchFiles = require('./watch');
const createLivereload = require('./create-livereload');
const buildCSS = require('../build/css');
const buildJS = require('../build/js');
const formatWebsiteInfo = require('./format-website-info');

module.exports = async ({
  cwd,
  entries = {
    server: './index.js',
    browser: './browser/index.js',
    styles: './server/styles/index.scss',
  },
  compileDirs,
  cleanCompiledFiles = false,
  additionalWatchDirs = [],
  watchIgnore = [],
  abortOnInstanceError = false,
  showWatchedFiles = false,
  forceRequirePrebuiltTemplates = true,
} = {}) => {
  const start = process.hrtime();
  if (forceRequirePrebuiltTemplates) process.env.MARKO_REQUIRE_PREBUILT_TEMPLATES = true;
  const livereload = createLivereload();

  await Promise.all([
    // compile any uncompiled or out-of-date marko templates before starting the server instance
    compileMarkoFiles({ cwd, dirs: compileDirs, clean: cleanCompiledFiles }),
    // build css
    buildCSS({
      cwd,
      entry: entries.styles,
      watch: true,
      onFileChange: () => livereload.refresh('/'),
    }),
    // build js
    buildJS({
      cwd,
      entry: entries.browser,
      watch: true,
      onFileChange: () => livereload.refresh('/'),
    }),
  ]);

  // fork and start the server instance
  log('starting forked server...');
  const serverStart = process.hrtime();
  const server = ForkServer({
    cwd,
    entry: entries.server,
    onReady: () => livereload.refresh('/'),
  });
  const message = await server.listen({ rejectOnNonZeroExit: abortOnInstanceError });
  log(`server fork started in ${getProfileMS(serverStart)}ms`);

  // enable file watching
  await watchFiles({
    server,
    cwd,
    additonalDirs: additionalWatchDirs,
    showFiles: showWatchedFiles,
    rejectOnNonZeroExit: abortOnInstanceError,
    ignore: watchIgnore,
  });
  log(`done in ${getProfileMS(start)}ms`);
  log(formatWebsiteInfo(message));
};
