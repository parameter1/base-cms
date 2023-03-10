const path = require('path');
const { readFile } = require('fs').promises;
const { readFileSync } = require('fs');
const { asyncRoute } = require('@parameter1/base-cms-utils');

const modes = new Set(['main', 'purged', 'optimized', 'critical']);

const readManifest = async (loc) => {
  try {
    const contents = await readFile(loc, 'utf8');
    return JSON.parse(contents);
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
};

/**
 * @typedef {import("@parameter1/base-cms-web-cli/build/utils/css.js")
 *  .WrittenCSSOutputAsset} WrittenCSSOutputAsset
 *
 * @param {object} params
 * @param {string} params.distDir
 * @returns {Promise<WrittenCSSOutputAsset[]>}
 */
const loadManifestEntries = async ({ distDir }) => {
  const file = path.resolve(distDir, 'css', 'manifest.json');
  const manifest = await readManifest(file);
  if (!manifest) throw new Error('Unable to load the CSS asset manifest');
  return Object.keys(manifest).map((key) => {
    const asset = { key, ...manifest[key] };
    return asset;
  });
};

const isProduction = process.env.NODE_ENV === 'production';

module.exports = ({ distDir }) => asyncRoute(async (req, res, next) => {
  const { cdn } = res.locals;
  const { app } = req;
  if (!app.locals.css) app.locals.css = {};
  const { css } = app.locals;

  // determine the current CSS mode
  // use the env first and fallback to main (all).
  let mode = process.env.CSS_MODE || 'main';
  if (!modes.has(mode)) mode = 'main';

  // then allow the request query or a cookie to override this.
  const key = '__css';
  if (modes.has(req.query[key])) {
    mode = req.query[key];
  } else if (modes.has(req.cookies[key])) {
    mode = req.cookie[key];
  }

  // always set the mode to the app on every request.
  css.mode = mode;

  // when on production, only load the file paths and/or contents from the manifest once
  // as long as the cdn configs are the same (allows for changing the cdn env var in prod)
  if (isProduction && css.ready && css.cdn === cdn.enabled) return next();

  css.cdn = cdn.enabled;

  const items = await loadManifestEntries({ distDir });
  const files = items.reduce((map, asset) => {
    if (asset.embedded) return map;
    map.set(asset.key, cdn.dist(`css/${asset.file}`));
    return map;
  }, new Map());
  css.files = files;

  const embeddable = items.reduce((map, asset) => {
    if (!asset.embedded) return map;
    map.set(asset.key, path.resolve(distDir, 'css', asset.file));
    return map;
  }, new Map());
  css.embeddable = embeddable;

  css.main = () => files.get('main');
  css.purged = () => files.get('purged');

  css.optimized = ({ kind, type } = {}) => {
    // attempt to load the optimized file from most to least specific.
    const keys = [];
    if (kind && type) keys.push(`optimized-${kind}.${type}`);
    if (kind) keys.push(`optimized-${kind}`);
    keys.push('optimized');

    return keys.reduce((file, k) => {
      if (file) return file;
      return files.get(k) || null;
    }, null);
  };

  css.critical = ({ kind, type } = {}) => {
    // attempt to load the critical file from most to least specific.
    const keys = [];
    if (kind && type) keys.push(`critical-${kind}.${type}`);
    if (kind) keys.push(`critical-${kind}`);
    keys.push('critical');

    const critical = keys.reduce((file, k) => {
      if (file) return file;
      return embeddable.get(k) || null;
    }, null);
    if (!critical) return null;
    // @todo determine if this should read contents all the time or store in memory?
    const contents = readFileSync(critical, 'utf8');
    return `/* ${critical.split('/').pop()} */ ${contents}`;
  };

  css.ready = true;

  return next();
});
