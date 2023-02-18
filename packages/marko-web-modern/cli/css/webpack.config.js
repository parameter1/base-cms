const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
// @todo update this from 4 to 8? must test in legacy build as well
const sass = require('node-sass');

const stylePattern = /\.(s[ac]ss|css)$/i;

module.exports = ({ cwd, entry }) => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    mode: isProduction ? 'production' : 'development',
    context: cwd,
    entry,
    devtool: 'source-map',
    output: {
      path: path.resolve(cwd, 'modern/dist/css'),
      filename: 'js/[name].js', // for the default index output (will be deleted)
      publicPath: '/modern/dist/css/',
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
      ],
    },
  };
};
