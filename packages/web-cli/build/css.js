const path = require('path');
const { rm } = require('fs').promises;
const del = require('del');
const { dim, cyan } = require('chalk');
const {
  buildCriticals,
  buildMain,
  buildManifest,
  buildPurged,
  getCSSFromOutput,
  logBuildStep,
  minify,
  write,
} = require('./utils/css');

const { log } = console;

/**
 * @typedef {import("./utils/css.js").RollupWatcher} RollupWatcher
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
   * @param {object} params
   * @param {CSSOutputAsset} params.main
   */
  const build = async ({ main }) => {
    const purged = await buildPurged({ cwd, source: main.source, contentDirs: purgeContentDirs });
    const criticals = await buildCriticals({ source: purged.source });
    const minified = await minify({ assets: [main, purged, ...criticals] });
    const written = await write({ cwd, dir, assets: minified });
    await buildManifest({ cwd, dir, written });
    return written;
  };

  if (!inWatchMode) {
    // normal build
    logBuildStep();

    // clean directory
    await rm(path.resolve(cwd, dir), { recursive: true, force: true });

    /** @type {CSSOutputAsset} */
    const main = await buildMain({ cwd, entry, watch: false });
    await build({ main });
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
      await (async () => {
        const { output } = await event.result.generate({
          dir: path.resolve(cwd, dir),
        });

        const main = getCSSFromOutput(output);
        const written = await build({ main });

        // clean old files
        const pathsToDelete = written.map(({ file }) => `!${path.resolve(dir, file)}`);
        await del([path.resolve(dir, './*.css'), ...pathsToDelete]);
      })().then(() => {
        event.result.close();
        if (typeof onFileChange === 'function') onFileChange();
      });
    }
  });

  await new Promise((resolve, reject) => {
    watcher.on('event', ({ code }) => {
      if (code === 'ERROR') reject();
      if (code === 'END') resolve();
    });
  });
};
