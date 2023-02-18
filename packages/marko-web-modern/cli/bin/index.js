#!/usr/bin/env node

/* eslint-disable global-require */
const minimist = require('minimist');
const log = require('fancy-log'); // @todo upgrade this!
const { blue, gray, green } = require('chalk'); // @todo upgrade this!

const { isArray } = Array;
log('cli starting...');
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

  if (!command) throw new Error('A CLI command must be provided.');

  log(`running '${blue(command)}' command in '${gray(cwd)}'`);

  if (!commands.has(command)) throw new Error(`The command ${command} was not found.`);

  if (command === 'build:css') {
    const [entry = './server/styles/index.scss'] = rest;
    if (!entry) throw new Error('An entrypoint is requred.');
    const builder = require('../build/css');
    await builder({ cwd, entry, watch: argv.watch });
    return exit(`command '${blue(command)}' ${green('complete')}`);
  }

  if (command === 'build:js') {
    const [entry = './browser/index.js'] = rest;
    if (!entry) throw new Error('An entrypoint is requred.');
    const builder = require('../build/js');
    await builder({ cwd, entry, watch: argv.watch });
    return exit(`command '${blue(command)}' ${green('complete')}`);
  }

  if (command === 'build:ssr') {
    const [entry = './browser/ssr.js'] = rest;
    if (!entry) throw new Error('An entrypoint is requred.');
    const builder = require('../build/ssr');
    await builder({ cwd, entry, watch: argv.watch });
    return exit(`command '${blue(command)}' ${green('complete')}`);
  }

  if (command === 'dev') {
    const serve = require('../serve');
    const opts = {
      cwd,
      entries: {
        server: argv.server || './index.js',
        browser: argv.browser || './browser/index.js',
        ssr: argv.ssr || './browser/ssr.js',
        styles: argv.styles || './server/styles/index.scss',
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
  return null;
})().catch(e => setImmediate(() => { throw e; }));
