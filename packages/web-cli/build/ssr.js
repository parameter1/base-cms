const vite = require('vite');
const vue = require('@vitejs/plugin-vue2');
const log = require('fancy-log');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const { mkdirp } = require('mkdirp');
const handleWatch = require('./utils/handle-watch');

module.exports = async ({
  cwd,
  entry,
  watch = false,
  onFileChange,
} = {}) => {
  const entryResolved = path.resolve(cwd, entry);
  const distPath = path.resolve(cwd, 'dist');
  const destination = path.resolve(distPath, 'ssr.js');

  if (!fs.existsSync(entryResolved)) {
    // ssr is optional but should warn when not found;
    log(chalk.yellow('WARNING:'), 'no ssr entry was found. writing an empty file...');
    await mkdirp(distPath);
    fs.writeFileSync(destination, 'module.exports = {};');
    log('empty ssr file written.');
    return;
  }

  const maybeWatcher = await vite.build({
    clearScreen: false,
    plugins: [vue()],
    root: cwd,
    define: {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
    },
    build: {
      lib: {
        entry,
        fileName: 'ssr',
        formats: ['cjs'],
      },
      emptyOutDir: false,
      ssr: true,
      outDir: './dist/',
      watch: watch ? {} : false,
    },
    ssr: {
      noExternal: true,
    },
  });
  await handleWatch({ watch, maybeWatcher, onFileChange });
};
