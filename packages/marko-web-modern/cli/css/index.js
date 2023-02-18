const webpack = require('webpack');
const sass = require('./webpack.config');

const { log } = console;
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
      log('Beginning style build and watch...');
      compiler.watch({
        ignored: /node_modules/,
      }, (err, stats) => {
        if (err || stats.hasErrors()) {
          reject(err || stats.toJson().errors);
        } else {
          const s = stats.toJson('minimal');
          log(`Styles built in ${s.time}ms to ${s.assetsByChunkName.main}`);

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
