const vite = require('vite');
const path = require('path');
const postcss = require('postcss');
const { writeFile, mkdir } = require('fs').promises;
const purgecss = require('@fullhuman/postcss-purgecss');
const critical = require('postcss-critical-split');
const cssnano = require('cssnano');
const defaultPreset = require('cssnano-preset-default');
const { gzip } = require('zlib');
const crypto = require('crypto');
const {
  bold,
  cyan,
  dim,
  green,
} = require('chalk');
const formatFileSize = require('./format-file-size');

const { log } = console;

const purgeGlobs = ['**/*.marko', '**/*.vue'];
const preset = defaultPreset({ discardComments: { removeAll: true } });

const createHash = (source) => {
  const hash = crypto.createHash('sha256').update(source).digest('hex');
  return hash.substring(0, 8);
};

/**
 * @typedef {import("rollup").OutputAsset} OutputAsset
 * @typedef {import("rollup").RollupOutput} RollupOutput
 * @typedef {import("rollup").RollupWatcher} RollupWatcher
 *
 * @typedef CSSOutputAsset
 * @prop {string} key
 * @prop {string} source
 * @prop {boolean} [embedded]
 *
 * @typedef WrittenCSSOutputAsset
 * @prop {string} key The file output target key, e.g. index, purged or critical
 * @prop {string} file The name of the written file, include it's content hash
 * @prop {number} size The file size, in bytes
 * @prop {number} compressed The gzipped file size, in bytes.
 * @prop {boolean} embedded Whether the output should be flagged as embeddable
 */

/**
 *
 * @param {OutputAsset[]} output
 * @returns {CSSOutputAsset}
 */
const getMainCSSFromOutput = (output) => {
  const chunk = output[0];
  const { source } = chunk;
  return { key: 'main', source, embedded: false };
};

/**
 *
 * @param {object} params
 * @param {string} params.cwd The current working directory.
 * @param {string} params.entry The entry SASS file
 * @param {boolean} [params.watch]
 * @returns {Promise<CSSOutputAsset|RollupWatcher>}
 */
const buildMain = async ({ cwd, entry, watch }) => {
  const file = path.resolve(cwd, entry);
  const result = await vite.build({
    appType: 'custom',
    mode: 'production',
    clearScreen: false,
    logLevel: 'warn',
    build: {
      minify: false,
      rollupOptions: { input: file },
      assetsDir: '.',
      write: false,
      watch: watch ? { skipWrite: true } : null,
    },
  });
  if (watch) return result;
  const { output } = result;
  return getMainCSSFromOutput(output);
};

/**
 *
 * @param {object} params
 * @param {string} params.cwd The current working directory
 * @param {string} params.source The CSS source to purge
 * @param {string[]} params.contentDirs Additional directories to extract content from.
 * @returns {Promise<CSSOutputAsset>}
 */
const buildPurged = async ({ cwd, source, contentDirs = [] }) => {
  /** @type {import("postcss").Result} */
  const result = await postcss([
    purgecss({
      content: purgeGlobs.reduce((arr, glob) => {
        [cwd, ...contentDirs].forEach((d) => {
          arr.push(path.resolve(cwd, path.join(d, glob)));
        });
        return arr;
      }, []),
      safelist: { standard: [/--/, /__/] },
    }),
  ]).process(source, { from: undefined });
  return { key: 'purged', source: result.css, embedded: false };
};

/**
 *
 * @param {object} params
 * @param {string} params.source
 * @returns {Promise<CSSOutputAsset[]>}
 */
const buildCriticals = async ({ source }) => {
  // extract the critical modules names that are in-use (if any)
  /** @type {string[]} */
  const modules = [...(source.match(/\/\*!\s*?critical.*?\s*?\*\//g) || []).reduce((set, match) => {
    if (/:end/.test(match)) return set;
    const matches = /\|(.+[^\s*?])\s*?\*\//.exec(match);
    if (matches && matches[1]) set.add(matches[1]);
    return set;
  }, new Set())];

  const keys = ['critical', 'optimized'];
  const settings = [];
  keys.forEach((key) => {
    const opts = {
      key,
      embedded: key === 'critical',
      output: key === 'critical' ? key : 'rest',
    };
    settings.push(opts);
    modules.forEach((name) => {
      settings.push({
        ...opts,
        key: `${key}-${name}`,
        modules: [name],
        separator: '|',
      });
    });
  });

  return Promise.all(settings.map(async ({ key, embedded, ...options }) => {
    /** @type {import("postcss").Result} */
    const result = await postcss([critical(options)]).process(source, { from: undefined });
    return { key, source: result.css, embedded };
  }));
};

/**
 *
 * @param {object} params
 * @param {CSSOutputAsset[]} params.assets
 * @returns {Promise<CSSOutputAsset[]>}
 */
const minify = async ({ assets }) => Promise.all(assets.map(async (asset) => {
  /** @type {import("postcss").Result} */
  const result = await postcss([cssnano({ preset })]).process(asset.source, { from: undefined });
  return { ...asset, source: result.css };
}));

/**
 *
 * @param {object} params
 * @param {string} params.cwd
 * @param {string} params.dir
 * @param {CSSOutputAsset[]} params.assets
 * @returns {Promise<WrittenCSSOutputAsset[]>}
 */
const write = async ({ cwd, dir, assets }) => {
  // only write assets that have code. its possible some optimized assets can be empty.
  const eligible = assets.filter((asset) => asset.source);

  // make the dir
  await mkdir(path.resolve(cwd, dir), { recursive: true });

  return Promise.all(eligible.map(async (asset) => {
    const { source, ...rest } = asset;

    // ensure charset is present. critical files will likely drop this.
    const s = /^@charset/.test(source) ? source : `@charset "UTF-8";${source}`;
    const hash = createHash(s);
    const file = `${asset.key}-${hash}.css`;

    const compressed = await new Promise((resolve, reject) => {
      gzip(s, (err, r) => {
        if (err) return reject(err);
        return resolve(r);
      });
    });

    const absolute = path.resolve(cwd, dir, file);
    await writeFile(absolute, s, 'utf8');

    return {
      ...rest,
      embedded: Boolean(asset.embedded),
      file,
      size: s.length,
      compressed: compressed.length,
    };
  }));
};

/**
 * @param {object} params
 * @param {string} params.cwd The current working directory
 * @param {string} params.dir The CSS dist directory
 * @param {WrittenCSSOutputAsset[]} params.written The written assets
 * @returns {Promise<object>}
 */
const buildManifest = async ({ cwd, dir, written }) => {
  const manifest = {};
  const longest = {
    file: 0,
    size: 0,
    compressed: 0,
  };
  written.forEach(({ key, ...rest }) => {
    manifest[key] = rest;
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

  await writeFile(path.resolve(cwd, dir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  return manifest;
};

/**
 *
 * @param {CSSOutputTarget} target
 */
const logBuildStep = () => log(cyan(`vite v${vite.version}`), green('building css for production...'));

module.exports = {
  buildCriticals,
  buildMain,
  buildManifest,
  buildPurged,
  getMainCSSFromOutput,
  logBuildStep,
  minify,
  write,
};
