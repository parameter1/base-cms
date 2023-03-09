const path = require('path');
const { readFile } = require('fs').promises;
const { asyncRoute } = require('@parameter1/base-cms-utils');

const modes = new Set(['all', 'purged', 'optimized', 'critical']);

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
    const asset = { target: key, ...manifest[key] };
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
  if (isProduction && css.files && css.cdn === cdn.enabled) return next();

  const items = await loadManifestEntries({ distDir });
  css.files = items.reduce((map, asset) => {
    if (asset.embedded) return map;
    map.set(asset.target, cdn.dist(`css/${asset.file}`));
    return map;
  }, new Map());

  const contents = await Promise.all(items.map(async (asset) => {
    if (!asset.embedded) return null;
    const str = await readFile(path.resolve(distDir, 'css', asset.file), 'utf8');
    return str;
  }));
  css.cdn = cdn.enabled;
  css.contents = contents.filter((v) => v).join('');

  return next();
});
