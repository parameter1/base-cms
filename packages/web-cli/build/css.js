const vite = require('vite');
const path = require('path');
const purgecss = require('@fullhuman/postcss-purgecss');
const critical = require('postcss-critical-split');
const handleWatch = require('./utils/handle-watch');

const purgeGlobs = ['**/*.marko', '**/*.vue'];

module.exports = async ({
  cwd,
  entry,
  watch = false,
  onFileChange,
  purgeContentDirs = [],
} = {}) => {
  const file = path.resolve(cwd, entry);

  /**
   *
   * @param {object} params
   * @param {string} params.dir
   * @param {import("vite").CSSOptions} params.css
   * @returns {import("vite").InlineConfig}
   */
  const options = ({ dir, css }) => {
    /** @type {import("vite").InlineConfig} */
    const opts = {
      appType: 'custom',
      mode: 'production',
      clearScreen: false,
      build: {
        rollupOptions: { input: file },
        assetsDir: '.',
        outDir: `./dist/css/${dir}`,
        manifest: true,
        watch: watch ? {} : false,
      },
      css,
    };
    return opts;
  };

  const purge = purgecss({
    content: purgeGlobs.reduce((arr, glob) => {
      [cwd, ...purgeContentDirs].forEach((dir) => {
        arr.push(path.resolve(cwd, path.join(dir, glob)));
      });
      return arr;
    }, []),
    safelist: {
      standard: [/--/, /__/],
    },
  });

  const maybeWatchers = await Promise.all([
    vite.build(options({
      dir: 'critical',
      css: { postcss: { plugins: [purge, critical({ output: 'critical' })] } },
    })),
    vite.build(options({
      dir: 'main',
      css: { postcss: { plugins: [purge, critical({ output: 'rest' })] } },
    })),
  ]);

  await Promise.all(maybeWatchers.map((maybeWatcher) => handleWatch({
    watch,
    maybeWatcher,
    onFileChange,
  })));
};
