const webpack = require('webpack');
const log = require('fancy-log');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const { mkdirp } = require('mkdirp');
const ssr = require('./webpack.config');

const { emitWarning } = process;

module.exports = async ({
  cwd,
  entry,
  watch = false,
  onFileChange,
} = {}) => {
  const entryResolved = path.resolve(cwd, entry);
  const distPath = path.resolve(cwd, 'dist');
  const destination = path.resolve(distPath, 'ssr.js');

  if (!fs.existsSync(entryResolved)) {
    // ssr is optional but should warn when not found;
    log(chalk.yellow('WARNING:'), 'no ssr entry was found. writing an empty file...');
    await mkdirp(distPath);
    fs.writeFileSync(destination, 'module.exports = {};');
    log('empty ssr file written.');
    return;
  }

  let watchStarted = false;
  const compiler = webpack(ssr({ cwd, entry }));
  if (watch) {
    await new Promise((resolve, reject) => {
      log('beginning ssr build and watch...');
      compiler.watch({
        ignored: /node_modules/,
      }, (err, stats) => {
        if (err || stats.hasErrors()) {
          reject(err || stats.toJson().errors);
        } else {
          const s = stats.toJson('minimal');
          log(`ssr scripts built in ${s.time}ms to ${s.assetsByChunkName.main}`);

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
