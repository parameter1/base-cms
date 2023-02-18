const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const sass = require('node-sass');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const absoluteRuntime = path.dirname(require.resolve('@babel/runtime/package.json'));
const imagePattern = /\.(png|svg|jpg|gif|webp)$/;

const isProduction = process.env.NODE_ENV === 'production';

const browser = ({ cwd, entry }) => ({
  mode: isProduction ? 'production' : 'development',
  cache: !isProduction,
  context: cwd,
  entry,
  devtool: isProduction ? 'source-map' : 'eval',
  output: {
    library: {
      name: 'CMSBrowserComponents',
      type: 'umd',
      export: 'default',
    },
    path: path.resolve(cwd, 'dist/modern/js'),
    filename: 'index.[contenthash:7].js',
    chunkFilename: '[name].[contenthash:7].js',
    publicPath: '/dist/modern/js/',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),
    new WebpackManifestPlugin({
      publicPath: '',
      filter: ({ name }) => !imagePattern.test(name),
    }),
    new BundleAnalyzerPlugin({ analyzerMode: 'static', reportFilename: '../analyzer-report.html' }),
  ],
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
        exclude: f => (
          /node_modules\/(?!@parameter1\/base-cms-marko-web.*?\/browser)/.test(f)
          && !/\.vue\.js/.test(f)
        ),
        options: {
          configFile: false,
          babelrc: false,
          cacheDirectory: false,
          presets: [
            [
              require.resolve('@babel/preset-env'),
              {
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
      // experimental scss file loading....
      {
        test: /\.scss$/,
        use: [
          {
            loader: require.resolve('style-loader'),
          },
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 2,
            },
          },
          {
            loader: require.resolve('postcss-loader'),
            options: {
              postcssOptions: {
                plugins: [
                  [
                    require.resolve('autoprefixer'),
                    {
                      overrideBrowserslist: [
                        'Chrome >= 64',
                        'Firefox >= 67',
                        'Edge >= 79',
                        'iOS >= 12',
                        'Safari >= 11.1',
                        'Opera >= 51',
                      ],
                    },
                  ],
                ],
              },
            },
          },
          {
            loader: require.resolve('sass-loader'),
            options: {
              implementation: sass,
              sassOptions: {
                quietDeps: true,
              },
            },
          },
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
});

module.exports = { browser };
