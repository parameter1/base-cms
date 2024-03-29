#!/usr/bin/env node

/* eslint-disable global-require */
const minimist = require('minimist');
const { blue, gray, green } = require('chalk');
const createLogger = require('../utils/create-logger');

const { isArray } = Array;

const commands = new Set(['compile']);
(async () => {
  const argv = minimist(process.argv.slice(2));
  const debug = !argv.silent;
  const log = createLogger({ debug });

  log('cli starting...');
  const [command] = argv._;

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

  const cwd = argv.cwd || process.cwd();

  if (!command) throw new Error('A CLI command must be provided.');

  log(`running '${blue(command)}' command in '${gray(cwd)}'`);

  if (!commands.has(command)) throw new Error(`The command ${command} was not found.`);

  if (command === 'compile') {
    const compile = require('../index');
    const opts = {
      cwd,
      dirs: getArrayValuesFor('dir'),
      clean: argv.clean == null ? true : argv.clean,
      debug,
    };
    log(`beginning '${blue('compile')}' with options`, opts);
    await compile(opts);
    log(`command '${blue(command)}' ${green('complete')}`);
    return process.exit(0);
  }
  return null;
})().catch((e) => setImmediate(() => { throw e; }));
