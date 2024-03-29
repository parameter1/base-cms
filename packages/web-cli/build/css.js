const path = require('path');
const { rm } = require('fs').promises;
const del = require('del');
const { dim, cyan } = require('chalk');
const {
  buildCriticals,
  buildMain,
  buildManifest,
  buildPurged,
  getMainCSSFromRollup,
  logBuildStep,
  minify,
  write,
} = require('./utils/css');

const { log } = console;

/**
 * @typedef {import("./utils/css.js").RollupWatcher} RollupWatcher
 * @typedef {import("./utils/css.js").MainCSSResult} MainCSSResult
 *
 * @param {object} params
 * @param {string} params.cwd
 * @param {string} params.entry
 * @param {boolean} [params.watch=false]
 * @param {Function} [params.onFileChange]
 * @param {string[]} [params.purgeContentDirs]
 */
module.exports = async ({
  cwd,
  entry,
  watch: inWatchMode = false,
  onFileChange,
  purgeContentDirs = [],
} = {}) => {
  const dir = './dist/css';

  /**
   *
   * @param {MainCSSResult} result
   */
  const build = async ({ main, assets }) => {
    const purged = await buildPurged({ cwd, source: main.source, contentDirs: purgeContentDirs });
    const criticals = await buildCriticals({ source: purged.source });
    const minified = await minify({ assets: [main, purged, ...criticals] });
    const written = await write({
      cwd,
      dir,
      assets: minified,
      files: assets,
    });
    await buildManifest({ cwd, dir, written });
    return written;
  };

  if (!inWatchMode) {
    // normal build
    logBuildStep();

    // clean directory
    await rm(path.resolve(cwd, dir, 'assets'), { recursive: true, force: true });
    await rm(path.resolve(cwd, dir), { recursive: true, force: true });

    /** @type {MainCSSResult} */
    const main = await buildMain({ cwd, entry, watch: false });
    await build(main);
    return;
  }

  // watch mode
  /** @type {RollupWatcher} */
  const watcher = await buildMain({ cwd, entry, watch: true });

  // clear vite watchers so we can manually control dependent builds and writes
  watcher.removeAllListeners();

  watcher.on('change', (id) => {
    log(`watch event '${cyan('change')}' detected in file ${dim(id)}`);
  });
  watcher.on('event', async (event) => {
    const { code } = event;
    if (code === 'BUNDLE_START') logBuildStep();
    if (code === 'BUNDLE_END') {
      const start = process.hrtime();
      await (async () => {
        const result = await event.result.generate({
          assetFileNames: '[name]-[hash][extname]',
          dir: path.resolve(cwd, dir),
        });

        const main = await getMainCSSFromRollup(entry, result);
        const written = await build(main);

        // clean old files
        await del([
          path.resolve(dir, './*.css'),
          ...written.css.map(({ file }) => `!${path.resolve(dir, file)}`),
        ]);
        await del([
          path.resolve(dir, './assets/*'),
          ...written.assets.map(({ file }) => `!${path.resolve(dir, file)}`),
        ]);
        const [secs, ns] = process.hrtime(start);
        log(cyan(`built css in ${Math.ceil((secs * 1000) + (ns / 1000000))}ms.`));
      })().then(() => {
        event.result.close();
        if (typeof onFileChange === 'function') onFileChange();
      });
    }
  });

  await new Promise((resolve, reject) => {
    watcher.on('event', ({ code, error }) => {
      if (code === 'ERROR') reject(error);
      if (code === 'END') resolve();
    });
  });
};
