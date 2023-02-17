/* eslint-disable global-require */
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const path = require('path');
const pump = require('pump');
const webpack = require('webpack-stream');
const wp = require('webpack');
const { dest, src } = require('gulp');
const { getIfUtils } = require('webpack-config-utils');
const { existsSync } = require('fs');
const { join } = require('path');
const completeTask = require('@parameter1/base-cms-cli-utils/task-callback');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const absoluteRuntime = path.dirname(require.resolve('@babel/runtime/package.json'));

/**
 * Loads a configuration callback in the current working
 * directory that receives the base webpack config.
 *
 * This function can modify the webpack config in any way.
 *
 * @param {string} cwd
 * @returns {function|null}
 */
const loadConfigCallback = (cwd) => {
  const fileName = 'webpack.base-cms.js';
  const fileLoc = join(cwd, fileName);
  const fileExists = existsSync(fileLoc);
  if (!fileExists) return null;
  // eslint-disable-next-line import/no-dynamic-require
  const fn = require(fileLoc);
  return typeof fn === 'function' ? fn : null;
};

module.exports = cwd => (cb) => {
  const configCallback = loadConfigCallback(cwd);
  const imagePattern = /\.(png|svg|jpg|gif|webp)$/;
  const { ifProduction, ifNotProduction } = getIfUtils(process.env.NODE_ENV || 'development');

  let baseConfig = {
    mode: ifProduction('production', 'development'),
    cache: ifNotProduction(),
    devtool: 'source-map',
    output: {
      library: {
        name: 'CMSBrowserComponents',
        type: 'umd',
        export: 'default',
      },
      filename: 'index.[contenthash:7].modern.js',
      chunkFilename: '[name].[contenthash:7].js',
      publicPath: '/dist/js/',
    },
    optimization: { minimize: true },
    module: {
      rules: [
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.vue$/,
          loader: require.resolve('vue-loader'),
        },
        {
          test: /\.js$/,
          loader: require.resolve('babel-loader'),
          exclude: file => (
            /node_modules\/(?!@parameter1\/base-cms-marko-web.*?\/browser)/.test(file)
            && !/\.vue\.js/.test(file)
          ),
          options: {
            configFile: false,
            babelrc: false,
            cacheDirectory: false,
            presets: [
              [
                require.resolve('@babel/preset-env'),
                {
                  ignoreBrowserslistConfig: true,
                  targets: {
                    chrome: '83',
                    edge: '80',
                    safari: '14',
                    firefox: '78',
                    opera: '69',
                    ios: '14',
                  },
                  bugfixes: true,
                  useBuiltIns: 'usage',
                  corejs: { version: '3' },
                  loose: false,
                  debug: false,
                  modules: false,
                  exclude: [
                    '@babel/plugin-proposal-class-properties',
                    '@babel/plugin-proposal-private-methods',
                    '@babel/plugin-proposal-private-property-in-object',
                  ],
                },
              ],
            ],
            plugins: [
              [
                require.resolve('@babel/plugin-transform-runtime'),
                {
                  absoluteRuntime,
                  regenerator: false,
                  corejs: false,
                  helpers: true,
                  useESModules: true,
                },
              ],
            ],
          },
        },
        {
          test: /\.css$/,
          use: [
            require.resolve('vue-style-loader'),
            require.resolve('css-loader'),
          ],
        },
        {
          test: imagePattern,
          loader: require.resolve('file-loader'),
          options: {
            name: '[name].[ext]',
            outputPath: '../assets',
          },
        },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
      new WebpackManifestPlugin({
        publicPath: '',
        filter: ({ name }) => !imagePattern.test(name),
      }),
      new BundleAnalyzerPlugin({ analyzerMode: 'static', reportFilename: 'dist/analyzer-report.html' }),
    ],
  };
  if (configCallback) baseConfig = configCallback({ baseConfig, ifProduction, ifNotProduction });

  pump([
    src('browser/index.js', { cwd }),
    webpack(baseConfig, wp),
    dest('dist/js', { cwd }),
  ], e => completeTask(e, cb));
};
