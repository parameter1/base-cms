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
  return `${type}/${asset.file}`;
};

const load = ({ distDir, subDir }) => readFileSync(path.resolve(distDir, subDir), 'utf8');

module.exports = ({ distDir, type, entry }) => {
  let file;
  let contents;
  return ({ embedded } = {}) => {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    // when on dev, always return the file from the manifest
    // as it may have changed during build.
    if (isDevelopment) {
      const subDir = loadFromManifest({ distDir, type, entry });
      if (!embedded) return `/dist/${subDir}`;
      return load({ distDir, subDir });
    }
    // otherwise, only retrieve it once
    if (!file) file = `/dist/${loadFromManifest({ distDir, type, entry })}`;
    if (!embedded) return file;
    if (!contents) contents = load({ distDir, subDir: file });
    return contents;
  };
};
