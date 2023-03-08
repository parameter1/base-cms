const vite = require('vite');
const path = require('path');
const purgecss = require('@fullhuman/postcss-purgecss');
const critical = require('postcss-critical-split');
const { writeFile, mkdir, rm } = require('fs').promises;
const del = require('del');
const { dim, cyan } = require('chalk');
const {
  buildManifest,
  buildOptions,
  formatOutput,
  logBuildStep,
} = require('./utils/css');

const purgeGlobs = ['**/*.marko', '**/*.vue'];

const { log } = console;

/**
 * @typedef {import("./utils/css.js").CSSOutputTarget} CSSOutputTarget
 * @typedef {import("./utils/css.js").FormattedOutputAsset} FormattedOutputAsset
 * @typedef {import("./utils/css.js").OutputAsset} OutputAsset
 * @typedef {import("postcss").AcceptedPlugin} AcceptedPlugin
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
   * @param {CSSOutputTarget} params.target
   * @param {CSSOutputTarget} [params.from]
   * @param {string} params.fileName
   * @param {AcceptedPlugin[]} [params.plugins]
   * @param {boolean} [params.embedded]
   * @returns {Promise<FormattedOutputAsset>}
   */
  const build = async ({
    target,
    from,
    fileName,
    plugins,
    embedded,
  }) => {
    logBuildStep(target);
    const file = path.resolve(cwd, from ? `${dir}/${fileName}` : fileName);
    const result = await vite.build(buildOptions({
      input: file,
      css: { postcss: { plugins } },
      watch: false,
    }));

    /** @type {OutputAsset} */
    const output = result.output[0];
    const formatted = await formatOutput(output, { target, embedded });

    const targetDir = path.resolve(cwd, dir);
    await mkdir(targetDir, { recursive: true });
    await writeFile(path.resolve(targetDir, formatted.file), output.source, 'utf8');
    return formatted;
  };

  const buildDependents = async ({ file }) => {
    const purged = await build({
      target: 'purged',
      from: 'all',
      fileName: file,
      plugins: [
        purgecss({
          content: purgeGlobs.reduce((arr, glob) => {
            [cwd, ...purgeContentDirs].forEach((d) => {
              arr.push(path.resolve(cwd, path.join(d, glob)));
            });
            return arr;
          }, []),
          safelist: { standard: [/--/, /__/] },
        }),
      ],
    });

    const criticals = await Promise.all([
      build({
        target: 'critical',
        from: 'purged',
        fileName: purged.file,
        plugins: [critical({ output: 'critical' })],
        embedded: true,
      }),
      build({
        target: 'optimized',
        from: 'purged',
        fileName: purged.file,
        plugins: [critical({ output: 'rest' })],
      }),
    ]);

    return [purged, ...criticals];
  };

  if (!inWatchMode) {
    // normal build

    // clean directory
    await rm(path.resolve(cwd, dir), { recursive: true, force: true });

    // build main css + all dependent css versions
    const all = await build({ target: 'all', fileName: entry });
    const dependents = await buildDependents({ file: all.file });
    await buildManifest({ dir, assets: [all, ...dependents] });
    return;
  }

  // watch mode
  /** @type {import("rollup").RollupWatcher} */
  const watcher = await vite.build(buildOptions({
    input: path.resolve(cwd, entry),
    watch: true,
  }));

  // clear vite watchers so we can manually control dependent builds and writes
  watcher.removeAllListeners();

  watcher.on('change', (id) => {
    log(`watch event '${cyan('change')}' detected in file ${dim(id)}`);
  });
  watcher.on('event', async (event) => {
    const { code } = event;
    const target = 'all';
    if (code === 'BUNDLE_START') logBuildStep(target);
    if (code === 'BUNDLE_END') {
      await (async () => {
        // write the file to the dist folder.
        const { output } = await event.result.write({
          dir: path.resolve(cwd, dir),
          assetFileNames: 'all-[hash][extname]',
        });
        const all = await formatOutput(output[0], { target });

        // build dependents and manifest
        const dependents = await buildDependents({ file: all.file });
        await buildManifest({ dir, assets: [all, ...dependents] });

        // clean old files
        const pathsToDelete = [all, ...dependents].map(({ file }) => `!${path.resolve(dir, file)}`);
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
