#!/usr/bin/env node
/* eslint-disable global-require */
const minimist = require('minimist');
const log = require('fancy-log');
const { blue, gray } = require('chalk');

const { isArray } = Array;
const commands = new Set(['dev']);

(async () => {
  const argv = minimist(process.argv.slice(2));
  const [command] = argv._;
  const cwd = argv.cwd || process.cwd();

  if (!command) throw new Error('A CLI command must be provided.');
  log(`running '${blue(command)}' command in '${gray(cwd)}'`);
  if (!commands.has(command)) throw new Error(`The command ${command} was not found.`);

  const getArrayValuesFor = (key, def) => {
    const value = argv[key];
    let values = [];
    if (isArray(value)) {
      values = value;
    } else if (value) {
      values = [value];
    }
    if (def && !values.length) return def;
    return values;
  };

  if (command === 'dev') {
    const serve = require('../serve');
    const opts = {
      cwd,
      entries: {
        server: argv.server || './index.js',
      },
      compileDirs: getArrayValuesFor('compile-dir'),
      cleanCompiledFiles: Boolean(argv['clean-compiled-files']),
      additionalWatchDirs: getArrayValuesFor('watch-dir'),
      watchIgnore: getArrayValuesFor('watch-ignore'),
      abortOnInstanceError: Boolean(argv['abort-on-error']),
      showWatchedFiles: Boolean(argv['show-watched-files']),
    };
    log(`beginning '${blue('dev')}' server with options`, opts);
    await serve(opts);
  }
})().catch((e) => setImmediate(() => { throw e; }));
