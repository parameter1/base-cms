#!/usr/bin/env node
/* eslint-disable global-require */
const minimist = require('minimist');
const log = require('fancy-log');
const { blue, gray } = require('chalk');

log('cli starting...');

const commands = new Set(['upgrade']);
(async () => {
  const argv = minimist(process.argv.slice(2));
  const [command] = argv._;

  const cwd = argv.cwd || process.cwd();

  if (!command) throw new Error('A CLI command must be provided.');
  log(`running '${blue(command)}' command in '${gray(cwd)}'`);

  if (!commands.has(command)) throw new Error(`The command ${command} was not found.`);

  if (command === 'upgrade') {
    const upgrade = require('./commands/upgrade');
    await upgrade({
      cwd,
      latest: argv.latest,
      prereleases: argv.prereleases,
    });
  }
})().catch((e) => setImmediate(() => { throw e; }));
