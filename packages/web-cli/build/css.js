const vite = require('vite');
const path = require('path');
const purgecss = require('@fullhuman/postcss-purgecss');
const handleWatch = require('./utils/handle-watch');

const purgeGlobs = ['**/*.marko', '**/*.vue'];

module.exports = async ({
  cwd,
  entry,
  watch = false,
  onFileChange,
  purge = false,
  purgeContentDirs = [],
} = {}) => {
  const common = {
    appType: 'custom',
    mode: 'production',
    clearScreen: false,
    build: {
      rollupOptions: { input: path.resolve(cwd, entry) },
      outDir: './dist/css/',
      manifest: true,
      sourcemap: true,
      watch: watch ? {} : false,
    },
  };

  const maybeWatchers = await Promise.all([
    vite.build(common),
    ...purge ? [
      vite.build({
        ...common,
        build: {
          ...common.build,
          outDir: './dist/purgedcss/',
        },
        css: {
          postcss: {
            plugins: [
              purgecss({
                content: purgeGlobs.reduce((arr, glob) => {
                  [cwd, ...purgeContentDirs].forEach((dir) => {
                    arr.push(path.resolve(cwd, path.join(dir, glob)));
                  });
                  return arr;
                }, []),
                safelist: {
                  standard: [/--/, /__/],
                },
              }),
            ],
          },
        },
      }),
    ] : [],
  ]);

  await Promise.all(maybeWatchers.map(async (maybeWatcher) => handleWatch({
    watch,
    maybeWatcher,
    onFileChange,
  })));
};
