const vite = require('vite');
const path = require('path');
const handleWatch = require('./utils/handle-watch');

module.exports = async ({
  cwd,
  entry,
  watch = false,
  onFileChange,
} = {}) => {
  const maybeWatcher = await vite.build({
    mode: 'production',
    build: {
      rollupOptions: {
        input: path.resolve(cwd, entry),
      },
      outDir: './dist/css/',
      manifest: true,
      sourcemap: true,
      watch: watch ? {} : false,
    },
  });
  await handleWatch({ watch, maybeWatcher, onFileChange });
};
