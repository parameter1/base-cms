const vite = require('vite');
const vue = require('@vitejs/plugin-vue2');
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
    plugins: [vue()],
    define: {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
    },
    build: {
      modulePreload: false,
      rollupOptions: {
        input: path.resolve(cwd, entry),
      },
      outDir: './dist/js/',
      manifest: true,
      sourcemap: true,
      watch: watch ? {} : false,
    },
  });
  await handleWatch({ watch, maybeWatcher, onFileChange });
};
