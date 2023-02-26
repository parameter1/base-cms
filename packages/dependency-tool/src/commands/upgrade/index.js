const fg = require('fast-glob');
const path = require('path');
const fs = require('fs');
const log = require('fancy-log');
const semver = require('semver');
const loadVersionInfo = require('./load-version-info');
const depTypes = require('./dep-types');
const testPackageName = require('./test-package-name');

module.exports = async ({ cwd, latest: forceLatest = false }) => {
  log('loading package json files...');
  const entries = fg.sync(['**/package.json'], {
    cwd,
    ignore: ['**/node_modules/**'],
  });

  const allDeps = new Map();
  const allDepNames = new Set();
  log('extracting dependency versions...');
  entries.forEach((file) => {
    const loc = path.resolve(cwd, file);
    const pkg = JSON.parse(fs.readFileSync(loc, 'utf8'));
    depTypes.forEach((type) => {
      const deps = pkg[type];
      if (!deps) return;
      Object.keys(deps).forEach((name) => {
        if (!testPackageName(name)) return;
        const range = deps[name];
        const coerced = semver.coerce(range);
        const key = `${name}@${range}`;
        allDepNames.add(name);
        allDeps.set(key, { name, range, version: coerced.version });
      });
    });
  });

  log('getting version info from npm...');
  const available = new Map();
  await Promise.all([...allDepNames].map(async (name) => {
    const info = await loadVersionInfo(name);
    available.set(name, info);
  }));

  log('determining versions to upgrade...');
  const toUpgrade = new Map();
  allDeps.forEach(({ name, range, version: current }, key) => {
    const info = available.get(name);
    if (!info) throw new Error(`Unable to get package info for ${name}`);
    const version = forceLatest
      ? info.latest
      : semver.maxSatisfying(info.versions, range);
    if (current === version) return;
    toUpgrade.set(key, { current, version });
  });

  log(`found ${toUpgrade.size} dependencies to upgrade`);
  if (!toUpgrade.size) return;

  log('updgrading package.json versions...');
  entries.forEach((file) => {
    const loc = path.resolve(cwd, file);
    const pkg = JSON.parse(fs.readFileSync(loc, 'utf8'));
    let hasChanges = false;
    depTypes.forEach((type) => {
      const deps = pkg[type];
      if (!deps) return;
      Object.keys(deps).forEach((name) => {
        if (!testPackageName(name)) return;
        const range = deps[name];
        const key = `${name}@${range}`;
        if (!toUpgrade.has(key)) return;
        const { version } = toUpgrade.get(key);
        pkg[type][name] = `^${version}`;
        hasChanges = true;
      });
    });
    if (hasChanges) {
      log(`writing new versions to ${file}`);
      fs.writeFileSync(loc, `${JSON.stringify(pkg, null, 2)}\n`);
    }
  });
  log('upgrade complete.');
};
