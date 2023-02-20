const { getProfileMS } = require('@parameter1/base-cms-utils');
const marko = require('@parameter1/base-cms-marko-compiler');
const log = require('fancy-log');
const ForkServer = require('./fork-server');
const watchFiles = require('./watch');
const formatServerInfo = require('./format-server-info');

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
} = {}) => {
  const start = process.hrtime();
  if (forceRequirePrebuiltTemplates) process.env.MARKO_REQUIRE_PREBUILT_TEMPLATES = true;

  await marko({ cwd, dirs: compileDirs, clean: cleanCompiledFiles });

  // fork and start the server instance
  log('starting forked server...');
  const serverStart = process.hrtime();
  const server = ForkServer({
    cwd,
    entry: entries.server,
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
  log(formatServerInfo(message));
};
