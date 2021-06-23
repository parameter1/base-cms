const { dest, src } = require('gulp');
const path = require('path');
const fs = require('fs');
const pump = require('pump');
const webpack = require('webpack-stream');
const wp = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const completeTask = require('@parameter1/base-cms-cli-utils/task-callback');
const compiler = require('vue-template-compiler');

module.exports = cwd => (cb) => {
  const entry = path.resolve(cwd, 'browser/ssr.js');
  const destination = path.resolve(cwd, 'dist', 'ssr.js');
  if (fs.existsSync(entry)) {
    pump([
      src('browser/ssr.js', { cwd }),
      webpack({
        target: 'node',
        mode: 'production',
        output: {
          filename: 'ssr.js',
          library: {
            type: 'commonjs',
            export: 'default',
          },
        },
        module: {
          rules: [
            {
              test: /\.vue$/,
              loader: require.resolve('vue-loader'),
              options: {
                transformAssetUrls: false,
                compiler,
                optimizeSSR: true,
                productionMode: true,
                exposeFilename: true,
                hotReload: false,
                compilerOptions: {
                  whitespace: 'preserve',
                },
              },
            },
          ],
        },
        plugins: [
          new VueLoaderPlugin(),
        ],
      }, wp),
      dest('dist', { cwd }),
    ], e => completeTask(e, cb));
  } else {
    // create empty file
    fs.writeFileSync(destination, 'module.exports = {};');
    completeTask(null, cb);
  }
};
