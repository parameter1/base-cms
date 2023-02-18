const livereload = require('livereload');

if (!process.env.LIVERELOAD_PORT) process.env.LIVERELOAD_PORT = 55893;

const { log } = console;

module.exports = () => {
  const { LIVERELOAD_PORT } = process.env;
  const server = livereload.createServer({ port: LIVERELOAD_PORT });
  log(`Livereload server listening on port ${LIVERELOAD_PORT}`);
  return server;
};
