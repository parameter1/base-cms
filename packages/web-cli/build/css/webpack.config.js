const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const sass = require('node-sass');
const targets = require('@parameter1/browserslist-config-base-cms');

const stylePattern = /\.(s[ac]ss|css)$/i;

module.exports = ({ cwd, entry }) => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    mode: isProduction ? 'production' : 'development',
    context: cwd,
    entry,
    devtool: 'source-map',
    output: {
      path: path.resolve(cwd, 'dist/css'),
      filename: 'js/[name].js', // for the default index output (will be deleted)
      publicPath: '/dist/css/',
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'index.[contenthash:7].css',
        chunkFilename: '[name].[contenthash:7].css',
      }),
      new CleanWebpackPlugin(),
      new WebpackManifestPlugin({
        publicPath: '',
      }),
    ],
    optimization: {
      minimize: isProduction,
      minimizer: [new CssMinimizerPlugin({
        test: stylePattern,
        minimizerOptions: {
          preset: require.resolve('cssnano-preset-default'),
        },
      })],
    },
    module: {
      rules: [
        {
          test: stylePattern,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
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
                        overrideBrowserslist: targets,
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
      ],
    },
  };
};
