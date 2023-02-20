const path = require('path');
const { fork } = require('child_process');

const isFn = (v) => typeof v === 'function';

module.exports = ({
  cwd,
  entry,
  onAfterRestart,
  onReady,
} = {}) => {
  let proc;

  const file = path.resolve(cwd, entry);

  const kill = async () => {
    if (proc) {
      await new Promise((resolve, reject) => {
        proc.on('exit', resolve);
        proc.on('error', reject);
        proc.kill();
      });
    }
  };

  const listen = async ({ rejectOnNonZeroExit = true } = {}) => {
    await kill();
    proc = fork(file, [], { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] });
    const msg = await new Promise((resolve, reject) => {
      proc.on('message', (message) => {
        if (message.event === 'ready') resolve(message);
      });
      proc.on('exit', (code) => {
        if (code && code !== 0 && rejectOnNonZeroExit) reject(new Error(`Forked process received a non-zero (${code}) exit code.`));
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
