#!/usr/bin/env node

/* eslint-disable global-require */
const minimist = require('minimist');

const { log } = console;
const { isArray } = Array;
log('CLI starting...');
const exit = (message, code = 0) => {
  log(message);
  process.exit(code);
};


const commands = new Set(['build:css', 'build:js', 'dev']);
(async () => {
  const argv = minimist(process.argv.slice(2));
  const [command, ...rest] = argv._;

  const getArrayValuesFor = (key) => {
    const value = argv[key];
    let values = [];
    if (isArray(value)) {
      values = value;
    } else if (value) {
      values = [value];
    }
    return values;
  };


  const cwd = argv.cwd || process.cwd();

  if (!command) return exit('A CLI command must be provided.', 1);

  log(`Running command ${command}...`);
  if (!commands.has(command)) return exit(`The command ${command} was not found.`, 1);

  if (command === 'build:css') {
    const [entry = './server/styles/index.scss'] = rest;
    if (!entry) return exit('An entrypoint is requred.', 1);
    const builder = require('../build/css');
    await builder({ cwd, entry, watch: argv.watch });
  }

  if (command === 'build:js') {
    const [entry = './browser/index.js'] = rest;
    if (!entry) return exit('An entrypoint is requred.', 1);
    const builder = require('../build/js');
    await builder({ cwd, entry, watch: argv.watch });
  }

  if (command === 'dev') {
    const serve = require('../serve');
    const opts = {
      cwd,
      entries: {
        server: argv.server || './index.js',
        browser: argv.browser || './browser/index.js',
        styles: argv.styles || './server/styles/index.scss',
      },
      compileDirs: getArrayValuesFor('compile-dir'),
      cleanCompiledFiles: Boolean(argv['clean-compiled-files']),
      additionalWatchDirs: getArrayValuesFor('watch-dir'),
      watchIgnore: getArrayValuesFor('watch-ignore'),
      abortOnInstanceError: Boolean(argv['abort-on-error']),
      showWatchedFiles: Boolean(argv['show-watched-files']),
    };
    log('Beginning dev server with options', opts);
    await serve(opts);
  }

  return exit('Command complete');
})().catch(e => setImmediate(() => { throw e; }));
