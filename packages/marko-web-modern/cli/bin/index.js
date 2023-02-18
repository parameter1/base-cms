#!/usr/bin/env node

/* eslint-disable global-require */
const minimist = require('minimist');
const path = require('path');
const fs = require('fs/promises');

const { log } = console;
log('CLI starting...');
const exit = (message, code = 0) => {
  log(message);
  process.exit(code);
};

const fileExists = async (...paths) => {
  const loc = path.resolve(...paths);
  try {
    await fs.stat(loc);
    return true;
  } catch (e) {
    if (e.code === 'ENOENT') return false;
    throw e;
  }
};

(async () => {
  const argv = minimist(process.argv.slice(2));
  const [command, ...rest] = argv._;

  const cwd = argv.cwd || process.cwd();

  if (!command) return exit('A CLI command must be provided.', 1);

  log(`Running command ${command}...`);

  if (command === 'build:css') {
    if (!entry) return exit('An entrypoint is requred.', 1);
    const exists = await fileExists(cwd, entry);
    if (!exists) return exit(`No entry file was found for ${path.resolve(cwd, entry)}`, 1);

    const builder = require('../build/css');
    await builder({ cwd, entry, watch: argv.watch });
    return exit('Command complete');
  }

  return exit(`The command ${command} was not found.`, 1);
})().catch(e => setImmediate(() => { throw e; }));
