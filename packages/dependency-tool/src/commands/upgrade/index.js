const chalk = require('chalk');
const log = require('fancy-log');
const semver = require('semver');
const cwd = require('@parameter1/base-cms-cli-utils/get-cwd');
const logCmd = require('@parameter1/base-cms-cli-utils/log-command');
const exit = require('@parameter1/base-cms-cli-utils/print-and-exit');
const loadPackage = require('./load-package');
const exractDeps = require('./extract-deps');
const loadVersionInfo = require('./load-version-info');
const updatePackage = require('./update-package');
const savePackage = require('./save-package');
const loadWorkspaceDirs = require('./load-workspace-dirs');

const { isArray } = Array;

const execute = async ({ dir, forceLatest, prereleases }) => {
  const pkg = loadPackage({ dir });
  log(chalk`Loaded package {magenta ${pkg.name}}`);
  const baseDepMap = exractDeps(pkg);
  log(`Found ${baseDepMap.size} dependencies`);
  const names = new Set([...baseDepMap.values()].map(({ name }) => name));

  const packageVersionMap = new Map();
  await Promise.all([...names].map(async (name) => {
    const { versions } = await loadVersionInfo(name);
    const latest = prereleases
      ? [...versions].pop()
      : versions.filter(v => !semver.prerelease(v)).pop();
    packageVersionMap.set(name, { versions, latest });
  }));


  const toChange = new Map();
  baseDepMap.forEach(({ name, v: range }, key) => {
    const { versions: available, latest } = packageVersionMap.get(name);
    const { version: current } = semver.coerce(range);

    const maxSatisfying = semver.maxSatisfying(available, range);
    const newVersion = forceLatest ? latest : maxSatisfying;

    if (newVersion === current) return;

    if (semver.gt(latest, newVersion)) {
      log(chalk`{yellow WARNING:} The latest version of {grey ${name}} is {red ${latest}} but will use {green ${newVersion}} until the {blue --latest} flag is used`);
    }

    toChange.set(key, `^${newVersion}`);
  });

  if (toChange.size) {
    updatePackage(toChange, pkg);
    savePackage(dir, pkg);
    log(chalk`Upgrade of package {magenta ${pkg.name}} complete`);
  } else {
    log('No dependencies need upgrading... exiting');
  }

  if (isArray(pkg.workspaces)) {
    log(chalk`Workspaces detected. Will upgrade recursively: {gray ${JSON.stringify(pkg.workspaces)}}`);
    const workspaceDirs = loadWorkspaceDirs(dir, pkg.workspaces);
    await Promise.all(workspaceDirs.map(async wsDir => execute({ dir: wsDir, forceLatest })));
  }
};

module.exports = ({ path, latest: forceLatest = false, prereleases = false }) => {
  const dir = cwd(path);
  logCmd('upgrade', dir);

  execute({ dir, forceLatest, prereleases }).then(() => {
    exit(chalk`{green Upgrade complete!}`, 0);
  }).catch((e) => {
    exit(e.message);
  });
};
