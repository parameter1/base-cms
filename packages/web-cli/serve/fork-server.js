const path = require('path');
const child = require('child_process');
const log = require('fancy-log');

const isFn = (v) => typeof v === 'function';

module.exports = ({
  cwd,
  entry,
  onAfterRestart,
  onReady,
} = {}) => {
  /** @type {child.ChildProcess} */
  let proc;

  const file = path.resolve(cwd, entry);

  const kill = async () => {
    if (proc) {
      await new Promise((resolve, reject) => {
        proc.on('exit', resolve);
        proc.on('error', reject);
        let killed = proc.kill('SIGINT');
        ['SIGINT', 'SIGKILL'].forEach((signal) => {
          if (!killed) killed = proc.kill(signal);
        });
        if (!killed) {
          // since there is an exit code, resolve so a new proc can be spawned.
          if (proc.exitCode != null) {
            resolve();
          } else {
            reject(new Error('The server process was unable to be killed but is not providing an exit code.'));
          }
        }
      });
    }
  };

  const spawn = () => new Promise((resolve, reject) => {
    proc = child.spawn('node', [file], { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] });
    proc.on('spawn', resolve);
    proc.on('error', reject);
  });

  const listen = async ({ rejectOnNonZeroExit = true } = {}) => {
    log('killing current server...');
    await kill();
    log('spawning new server process...');
    await spawn();
    log('waiting for marko web server to be ready...');
    const msg = await new Promise((resolve, reject) => {
      proc.on('message', (message) => {
        if (message.event === 'ready') resolve(message);
      });
      proc.on('exit', (code) => {
        if (code && code !== 0 && rejectOnNonZeroExit) reject(new Error(`Spawned process received a non-zero (${code}) exit code.`));
      });
    });
    if (isFn(onReady)) await onReady();
    return msg;
  };

  return {
    kill,
    listen,
    restart: async (...args) => {
      const message = await listen(...args);
      if (isFn(onAfterRestart)) await onAfterRestart();
      return message;
    },
  };
};
