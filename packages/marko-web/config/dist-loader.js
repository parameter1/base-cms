const path = require('path');
const { readFileSync } = require('fs');

const read = (file) => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
};

const loadFromManifest = ({ distDir, type, entry }) => {
  const file = path.resolve(distDir, type, 'manifest.json');
  const manifest = read(file);
  if (!manifest) throw new Error(`Unable to load the asset manifest for type ${type}`);
  const asset = manifest[entry];
  if (!asset) throw new Error(`Unable to extract an asset for type ${type} using manifest entry ${entry}`);
  return `/dist/${type}/${asset.file}`;
};

module.exports = ({ distDir, type, entry }) => {
  let file;
  const isDevelopment = process.env.NODE_ENV !== 'production';
  return () => {
    // when on dev, always return the file from the manifest
    // as it may have changed during build.
    if (isDevelopment) return loadFromManifest({ distDir, type, entry });
    // otherwise, only retrieve it once
    if (!file) file = loadFromManifest({ distDir, type, entry });
    return file;
  };
};
