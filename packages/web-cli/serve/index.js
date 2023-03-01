const { getProfileMS } = require('@parameter1/base-cms-utils');
const log = require('fancy-log');
const ForkServer = require('./fork-server');
const build = require('../build');
const watchFiles = require('./watch');
const createLivereload = require('./create-livereload');
const formatServerMessage = require('./format-website-info');

module.exports = async ({
  cwd,
  entries,
  compileDirs,
  cleanCompiledFiles = false,
  additionalWatchDirs = [],
  watchIgnore = [],
  abortOnInstanceError = false,
  showWatchedFiles = false,
  forceRequirePrebuiltTemplates = true,
  purgeCSS = false,
  purgeCSSContentDirs = [],
} = {}) => {
  const start = process.hrtime();
  if (forceRequirePrebuiltTemplates) process.env.MARKO_REQUIRE_PREBUILT_TEMPLATES = true;
  const livereload = createLivereload();

  let serverInfo;

  await build({
    cwd,
    entries,
    compileDirs,
    cleanCompiledFiles,
    watch: true,
    purgeCSS,
    purgeCSSContentDirs,
    onFileChange: () => {
      if (serverInfo) log(serverInfo);
      livereload.refresh('/');
    },
  });

  // fork and start the server instance
  log('starting forked server...');
  const serverStart = process.hrtime();
  const server = ForkServer({
    cwd,
    entry: entries.server,
    onReady: () => livereload.refresh('/'),
  });
  const message = await server.listen({ rejectOnNonZeroExit: abortOnInstanceError });
  serverInfo = formatServerMessage(message);
  log(`server started in ${getProfileMS(serverStart)}ms`);

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
  log(serverInfo);
};
