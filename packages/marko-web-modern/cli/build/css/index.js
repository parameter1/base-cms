const webpack = require('webpack');
const log = require('fancy-log');
const sass = require('./webpack.config');

const { emitWarning } = process;

module.exports = async ({
  cwd,
  entry,
  watch = false,
  onFileChange,
} = {}) => {
  let watchStarted = false;
  const compiler = webpack(sass({ cwd, entry }));
  if (watch) {
    await new Promise((resolve, reject) => {
      log('beginning style build and watch...');
      compiler.watch({
        ignored: /node_modules/,
      }, (err, stats) => {
        if (err || stats.hasErrors()) {
          reject(err || stats.toJson().errors);
        } else {
          const s = stats.toJson('minimal');
          log(`styles built in ${s.time}ms to ${s.assetsByChunkName.main}`);

          if (watchStarted) {
            if (typeof onFileChange === 'function') onFileChange();
            if (s.warnings.length) emitWarning(`Webpack warnings found: ${s.warnings.join('\n')}`);
          }
          if (!watchStarted) watchStarted = true;
          resolve(stats);
        }
      });
    });
  } else {
    await new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err || stats.hasErrors()) {
          reject(err || stats.toJson().errors);
        } else {
          log(stats.toString());
          resolve(stats);
        }
      });
    });
  }
};
