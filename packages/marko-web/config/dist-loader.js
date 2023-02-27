const path = require('path');
const { readFileSync } = require('fs');

const loadFromManifest = ({ distDir, type, entry }) => {
  const file = path.resolve(distDir, type, 'manifest.json');
  const json = readFileSync(file, { encoding: 'utf8' });
  const manifest = JSON.parse(json);
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
