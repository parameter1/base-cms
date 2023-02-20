const livereload = require('livereload');
const log = require('fancy-log');
const { green, magenta } = require('chalk');

if (!process.env.LIVERELOAD_PORT) process.env.LIVERELOAD_PORT = 5010;

module.exports = () => {
  const { LIVERELOAD_PORT } = process.env;
  const server = livereload.createServer({ port: LIVERELOAD_PORT });
  log(`livereload ${green('listening')} on port ${magenta(LIVERELOAD_PORT)}`);
  return server;
};
