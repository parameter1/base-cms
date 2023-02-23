const log = require('fancy-log');
const { blue, grey } = require('chalk');

module.exports = async ({ watch, maybeWatcher, onFileChange }) => {
  if (!watch) return;

  maybeWatcher.on('change', (id) => {
    log(`watch event '${blue('change')}' detected in file ${grey(id)}`);
  });

  maybeWatcher.on('event', ({ code }) => {
    if (code === 'BUNDLE_END' && typeof onFileChange === 'function') {
      onFileChange();
    }
  });

  await new Promise((resolve, reject) => {
    maybeWatcher.on('event', ({ code, result }) => {
      if (result) result.close();
      if (code === 'ERROR') reject();
      if (code === 'END') resolve();
    });
  });
};
