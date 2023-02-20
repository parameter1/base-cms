const { getProfileMS } = require('@parameter1/base-cms-utils');
const marko = require('@parameter1/base-cms-marko-compiler');
const log = require('fancy-log');
const css = require('./build/css');
const js = require('./build/js');
const ssr = require('./build/ssr');

module.exports = async ({
  cwd,
  entries = {
    server: './index.js',
    browser: './browser/index.js',
    ssr: './browser/ssr.js',
    styles: './server/styles/index.scss',
  },
  compileDirs,
  cleanCompiledFiles = false,
  watch = false,
  onFileChange,
} = {}) => {
  const start = process.hrtime();

  await Promise.all([
    // compile any uncompiled or out-of-date marko templates before starting the server instance
    marko({
      cwd,
      dirs: compileDirs,
      clean: cleanCompiledFiles,
      debug: true,
    }),
    css({
      cwd,
      entry: entries.styles,
      watch,
      onFileChange,
    }),
    js({
      cwd,
      entry: entries.browser,
      watch,
      onFileChange,
    }),
    ssr({
      cwd,
      entry: entries.ssr,
      watch,
      onFileChange,
    }),
  ]);
  log(`done building in ${getProfileMS(start)}ms`);
};
