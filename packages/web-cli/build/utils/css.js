const vite = require('vite');
const path = require('path');
const { writeFile } = require('fs').promises;
const { gzip } = require('zlib');
const {
  bold,
  cyan,
  dim,
  green,
} = require('chalk');
const formatFileSize = require('./format-file-size');

const { log } = console;

/**
 * @typedef {('all'|'purged'|'critical'|'optimized')} CSSOutputTarget
 * @typedef {import("rollup").OutputAsset} OutputAsset
 * @typedef {import("vite").CSSOptions} CSSOptions
 * @typedef {import("vite").InlineConfig} InlineConfig
 *
 * @typedef FormattedOutputAsset
 * @prop {CSSOutputTarget} target The file output target type, e.g. all or critical
 * @prop {string} file The name of the written file, include it's content hash
 * @prop {number} size The file size, in bytes
 * @prop {number} compressed The gzipped file size, in bytes.
 * @prop {boolean} embedded Whether the output should be flagged as embeddable
 */

/**
 * @param {object} params
 * @param {string} params.input The absolute input file.
 * @param {CSSOptions} [params.css] Additional CSS build options.
 * @param {boolean} params.watch Whether to put the vite/rollup build into watch mode.
 * @returns {InlineConfig}
 */
const buildOptions = ({ input, watch, css }) => ({
  appType: 'custom',
  mode: 'production',
  clearScreen: false,
  logLevel: 'warn',
  // do not minify, otherwise critical and purge comments aren't properly passed through.
  esbuild: { minifySyntax: false },
  build: {
    rollupOptions: { input },
    assetsDir: '.',
    write: false,
    watch: watch ? { skipWrite: true } : null,
  },
  css,
});

/**
   * @param {object} params
   * @param {string} params.dir The CSS dist directory
   * @param {FormattedOutputAsset[]} params.assets The asset outputs
   * @returns {Promise<object>}
   */
const buildManifest = async ({ dir, assets }) => {
  const manifest = {};
  const longest = {
    file: 0,
    size: 0,
    compressed: 0,
  };
  assets.forEach(({ target, ...rest }) => {
    manifest[target] = rest;
    const { file } = rest;
    const loc = path.join(dir, file);
    if (loc.length > longest.file) longest.file = loc.length;

    const size = formatFileSize(rest.size);
    if (size.length > longest.size) longest.size = size.length;

    const compressed = formatFileSize(rest.compressed);
    if (compressed.length > longest.compressed) longest.compressed = compressed.length;
  });

  Object.values(manifest).sort((a, b) => {
    if (a.size > b.size) return 1;
    if (a.size < b.size) return -1;
    return 0;
  }).forEach(({ file, size, compressed }) => {
    const rel = `${path.join(dir)}/`;
    let str = dim(rel);
    str += cyan(path.join(dir, file).replace(rel, '').padEnd(longest.file + 2 - rel.length));
    str += ` ${dim(bold(formatFileSize(size).padStart(longest.size)))}`;
    str += `${dim(' │ gzip: ')}`;
    str += dim(formatFileSize(compressed).padStart(longest.compressed));
    log(str);
  });

  await writeFile(path.resolve(dir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  return manifest;
};

/**
 * @param {OutputAsset} output
 * @param {object} params
 * @param {CSSOutputTarget} params.target The file output target type, e.g. all or critical
 * @param {boolean} [params.embedded] Whether the output should be flagged as embeddable
 * @returns {Promise<FormattedOutputAsset>}
 */
const formatOutput = async (output, { target, embedded }) => {
  const { name, source } = output;
  const basename = path.basename(name, path.extname(name));
  const targetFileName = output.fileName.replace(basename, target);

  const compressed = await new Promise((resolve, reject) => {
    gzip(source, (err, r) => {
      if (err) return reject(err);
      return resolve(r);
    });
  });

  return {
    target,
    file: targetFileName,
    size: source.length,
    compressed: compressed.length,
    embedded: Boolean(embedded),
  };
};

/**
 *
 * @param {CSSOutputTarget} target
 */
const logBuildStep = (target) => log(cyan(`vite v${vite.version}`), green(`building ${target} css for production...`));

module.exports = {
  buildManifest,
  buildOptions,
  formatOutput,
  logBuildStep,
};
