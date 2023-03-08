const path = require('path');
const { readFile } = require('fs').promises;
const { asyncRoute } = require('@parameter1/base-cms-utils');

const readManifest = async (loc) => {
  try {
    const contents = await readFile(loc, 'utf8');
    return JSON.parse(contents);
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
};

const getRelPathFromManifest = async ({ distDir, type, entry }) => {
  const file = path.resolve(distDir, type, 'manifest.json');
  const manifest = await readManifest(file);
  if (!manifest) throw new Error(`Unable to load the asset manifest for type ${type}`);

  const asset = manifest[entry];
  if (!asset) throw new Error(`Unable to extract an asset for type ${type} using manifest entry ${entry}`);
  return `${type}/${asset.file}`;
};

const isProduction = process.env.NODE_ENV === 'production';
const types = [
  { type: 'js', entry: 'browser/index.js' },
  { type: 'css', entry: 'server/styles/index.scss' },
];

module.exports = ({ distDir }) => asyncRoute(async (req, res, next) => {
  const { cdn } = res.locals;
  const { app } = req;

  if (!app.locals.assets) app.locals.assets = {};
  const { assets } = app.locals;

  // when on production, only load the file paths from the manifest once
  // as long as the cdn configs are the same (allows for changing the cdn env var in prod)
  if (isProduction && assets.files && assets.cdn === cdn.enabled) return next();

  // get file paths from manifests
  const rels = await Promise.all(types.map(async ({ type, entry }) => {
    const rel = await getRelPathFromManifest({ distDir, type, entry });
    return { type, rel };
  }));

  assets.files = rels.reduce((map, { type, rel }) => {
    const href = cdn.dist(rel);
    map.set(type, [href]);
    return map;
  }, new Map());
  assets.cdn = cdn.enabled;

  return next();
});
