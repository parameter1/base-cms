const vite = require('vite');
const path = require('path');
const postcss = require('postcss');
const { writeFile, mkdir } = require('fs').promises;
const purgecss = require('@fullhuman/postcss-purgecss');
const critical = require('postcss-critical-split');
const cssnano = require('cssnano');
const defaultPreset = require('cssnano-preset-default');
const url = require('postcss-url');
const { gzip } = require('zlib');
const crypto = require('crypto');
const {
  bold,
  cyan,
  dim,
  green,
  magenta,
} = require('chalk');
const formatFileSize = require('./format-file-size');

const { log } = console;

const purgeGlobs = ['**/*.marko', '**/*.vue'];
const preset = defaultPreset({ discardComments: { removeAll: true } });
const FILE_ASSET_FOLDER = 'assets';

const createHash = (source) => {
  const hash = crypto.createHash('sha256').update(source).digest('hex');
  return hash.substring(0, 8);
};

const getCompressedSize = async (source) => {
  const gzipped = await new Promise((resolve, reject) => {
    gzip(source, (err, r) => {
      if (err) return reject(err);
      return resolve(r);
    });
  });
  return gzipped.length;
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
 * @typedef MainCSSResult
 * @prop {CSSOutputAsset} main
 * @prop {OutputAsset[]} assets
 *
 * @typedef CSSWriteResult
 * @prop {WrittenCSSOutputAsset[]} css
 * @prop {WrittenOutputFileAsset[]} assets
 *
 *
 * @typedef WrittenCSSOutputAsset
 * @prop {string} key The file output target key, e.g. index, purged or critical
 * @prop {string} file The name of the written file, include it's content hash
 * @prop {number} size The file size, in bytes
 * @prop {number} compressed The gzipped file size, in bytes.
 * @prop {boolean} embedded Whether the output should be flagged as embeddable
 *
 * @typedef WrittenOutputFileAsset
 * @prop {string} key The output file key
 * @prop {string} file The name of the written asset file.
 * @prop {number} size The file size, in bytes
 * @prop {number} compressed The gzipped file size, in bytes.
 */

/**
 *
 * @param {string} entry
 * @param {RollupOutput} result
 * @returns {MainCSSResult}
 */
const getMainCSSFromRollup = async (entry, result) => {
  const basename = path.basename(entry, path.extname(entry));

  const { output } = result;

  const { main, assets } = output.reduce((o, asset) => {
    if (asset.name === `${basename}.css` && !o.main) {
      // main entry.
      return { ...o, main: asset };
    }
    o.assets.push(asset);
    return o;
  }, { main: null, assets: [] });

  if (!main) throw new Error(`Unable to extract a main CSS asset for entry ${entry}`);

  // ensure extracted file assets (svgs, pngs, etc) have their `url()` paths re-written
  // to a relative location otherwise they will 404.
  const relativeAssetUrls = await postcss([
    url({
      url: (asset) => {
        // preserve data and remote files.
        if (/^(?:data|http[s]?):/.test(asset.url)) return asset.url;
        return `./${FILE_ASSET_FOLDER}${asset.url}`;
      },
    }),
  ]).process(main.source, { from: undefined });

  return {
    main: { key: 'main', source: relativeAssetUrls.css, embedded: false },
    assets,
  };
};

/**
 *
 * @param {object} params
 * @param {string} params.cwd The current working directory.
 * @param {string} params.entry The entry SASS file
 * @param {boolean} [params.watch]
 * @returns {Promise<MainCSSResult|RollupWatcher>}
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
  return getMainCSSFromRollup(entry, result);
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
  // extract the critical module kinds (to sub-types, if present) that are in-use (if any)
  /** @type {Map<string, Set<string>>} */
  const modules = (source.match(/\/\*!\s*?critical.*?\s*?\*\//g) || []).reduce((map, match) => {
    if (/:end/.test(match)) return map;
    const matches = /\|(.+[^\s*?])\s*?\*\//.exec(match);
    if (matches && matches[1]) {
      const [kind, type] = matches[1].split('.');
      if (!map.has(kind)) map.set(kind, new Set());
      if (type) map.get(kind).add(type);
    }
    return map;
  }, new Map());

  const keys = ['critical', 'optimized'];
  const settings = [];
  keys.forEach((key) => {
    const opts = {
      key,
      embedded: key === 'critical',
      output: key === 'critical' ? key : 'rest',
    };
    settings.push(opts);
    modules.forEach((types, kind) => {
      settings.push({
        ...opts,
        key: `${key}-${kind}`,
        modules: [kind],
        separator: '|',
      });
      types.forEach((type) => {
        settings.push({
          ...opts,
          key: `${key}-${kind}.${type}`,
          modules: [kind, `${kind}.${type}`],
          separator: '|',
        });
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
 * @param {OutputAsset[]} params.files
 * @returns {Promise<CSSWriteResult>}
 */
const write = async ({
  cwd,
  dir,
  assets,
  files,
}) => {
  // only write assets that have code. its possible some optimized assets can be empty.
  const eligible = assets.filter((asset) => asset.source);

  // make the dir
  await mkdir(path.resolve(cwd, dir, `./${FILE_ASSET_FOLDER}`), { recursive: true });

  const [css, writtenAssets] = await Promise.all([
    // css files
    Promise.all(eligible.map(async (asset) => {
      const { source, ...rest } = asset;

      // ensure charset is present. critical files will likely drop this.
      const s = /^@charset/.test(source) ? source : `@charset "UTF-8";${source}`;
      const hash = createHash(s);
      // ensure asset key is safe to save
      const file = `${asset.key.replace(/[^a-z0-9_-]/gi, '-')}-${hash}.css`;

      const compressed = await getCompressedSize(s);

      const absolute = path.resolve(cwd, dir, file);
      await writeFile(absolute, s, 'utf8');
      return {
        ...rest,
        embedded: Boolean(asset.embedded),
        file,
        size: s.length,
        compressed,
      };
    })),
    // asset files extracted from css (e.g. svgs, pngs, etc)
    Promise.all(files.map(async (asset) => {
      const relative = path.join(`./${FILE_ASSET_FOLDER}`, asset.fileName);
      const absolute = path.resolve(cwd, dir, relative);
      const compressed = await getCompressedSize(asset.source);
      await writeFile(absolute, asset.source, 'utf8');
      return {
        key: relative,
        file: relative,
        size: asset.source.length,
        compressed,
      };
    })),
  ]);
  return { css, assets: writtenAssets };
};

/**
 * @param {object} params
 * @param {string} params.cwd The current working directory
 * @param {string} params.dir The CSS dist directory
 * @param {CSSWriteResult} params.written The written assets
 * @returns {Promise<object>}
 */
const buildManifest = async ({ cwd, dir, written }) => {
  const { css, assets } = written;
  const manifest = {};
  const longest = {
    file: 0,
    size: 0,
    compressed: 0,
  };
  [...css, ...assets].forEach(({ key, ...rest }) => {
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
    const isAsset = file.startsWith(`${FILE_ASSET_FOLDER}/`);
    // const fileName = isAsset ? file.replace(`${FILE_ASSET_FOLDER}/`, '') : file;

    const rel = isAsset ? `${path.join(dir)}/${FILE_ASSET_FOLDER}/` : `${path.join(dir)}/`;
    const fileColor = isAsset ? magenta : cyan;
    let str = dim(rel);
    str += fileColor(path.join(dir, file).replace(rel, '').padEnd(longest.file + 2 - rel.length));
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
  getMainCSSFromRollup,
  logBuildStep,
  minify,
  write,
};
