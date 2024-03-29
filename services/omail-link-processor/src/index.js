require('./newrelic');
const http = require('http');
const { createTerminus } = require('@godaddy/terminus');
const app = require('./app');
const pkg = require('../package.json');
const newrelic = require('./newrelic');
const {
  PORT,
  EXPOSED_HOST,
  EXPOSED_PORT,
  TERMINUS_SHUTDOWN_DELAY,
  TERMINUS_TIMEOUT,
} = require('./env');

const { log } = console;
const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, parseInt(ms, 10));
});

process.on('unhandledRejection', (e) => {
  newrelic.noticeError(e);
  throw e;
});

const server = http.createServer(app);

const run = async () => {
  createTerminus(server, {
    timeout: TERMINUS_TIMEOUT,
    healthChecks: { '/_health': () => ({ ping: 'pong' }) },
    beforeShutdown: async () => {
      if (TERMINUS_SHUTDOWN_DELAY) {
        log(`Delaying shutdown by ${TERMINUS_SHUTDOWN_DELAY}ms...`);
        await wait(TERMINUS_SHUTDOWN_DELAY);
      }
    },
  });

  return new Promise((resolve, reject) => {
    server.listen(PORT, (err) => {
      if (err) { reject(err); } else { resolve(); }
    });
  });
};

run()
  .then(() => log(`${pkg.name} v${pkg.version} running on http://${EXPOSED_HOST}:${EXPOSED_PORT}`))
  .catch((e) => setImmediate(() => {
    newrelic.noticeError(e);
    throw e;
  }));
