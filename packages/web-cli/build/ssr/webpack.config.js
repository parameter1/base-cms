const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const compiler = require('vue-template-compiler');

module.exports = ({ cwd, entry }) => ({
  context: cwd,
  entry,
  target: 'node',
  mode: 'production',
  output: {
    filename: 'ssr.js',
    library: {
      type: 'commonjs',
      export: 'default',
    },
    path: path.resolve(cwd, 'dist'),
    publicPath: '/dist/',
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
});
