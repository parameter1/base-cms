const fg = require('fast-glob');
const path = require('path');
const fs = require('fs');
const log = require('fancy-log');

const ci = require('./templates/node-ci.yml');
const integrationTests = require('./templates/integration-tests.yml');
const deployProduction = require('./templates/deploy-production.yml');
const deployStaging = require('./templates/deploy-staging.yml');

const folder = './.github/workflows';
const mkdir = (cwd, recursive) => {
  try {
    const dir = path.resolve(cwd, folder);
    fs.mkdirSync(dir, { recursive });
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
  }
};

const merge = (from, into) => [].reduce((o, k) => {
  const v = from[k];
  if (typeof v === 'undefined') return o;
  return { ...o, [k]: v };
}, into);

const buildMatrix = (sites) => `site:\n${sites.map((site) => `          - { id: ${site.id}, dir: ${site.dir}, stack: ${site.stack}, account: ${site.account}, tenant: ${site.tenant}, rancher_label: ${site.rancherLabel} }`).join('\n')}`;

module.exports = ({ cwd }) => {
  mkdir(cwd); // make the workflow directory.

  const write = (sites, file, template) => {
    if (!sites.length) return;
    const matrix = buildMatrix(sites);
    const contents = template.replace(/{{{ INSERT MATRIX HERE }}}/g, matrix);
    const loc = path.resolve(cwd, folder, file);
    fs.writeFileSync(loc, contents);
    log(`wrote file ${path.relative(cwd, loc)} with ${sites.length} website(s)`);
  };

  const entries = fg.sync(['sites/**/package.json'], {
    cwd,
    ignore: ['**/node_modules/**'],
  });

  const staging = [];
  const production = [];
  entries.forEach((file) => {
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));

    const { website } = pkg;
    if (!website) throw new Error(`No website configuration was found in ${file}`);

    const site = {};
    ['id', 'tenant', 'account', 'stack'].forEach((key) => {
      const value = website[key];
      if (!value) throw new Error(`No website.${key} was provided in ${file}`);
      site[key] = value; // ensure key order, as we'll use this as an id later.
    });
    // set the site directory.
    site.dir = file.replace(/\/package\.json$/, '').split('/').pop();
    // generate the label for rancher
    site.rancherLabel = pkg.name.replace('@', '').replace('/', '-');

    const { deploy } = website;
    if (!deploy) return; // no deployments

    if (deploy === true) {
      // both prudction and staging
      staging.push(site);
      production.push(site);
    }

    if (deploy.staging === true) {
      // staging
      staging.push(site);
    } else if (deploy.staging != null && deploy.staging.enabled !== false) {
      // staging, with merged settings
      staging.push(merge(deploy.staging, site));
    }

    if (deploy.production === true) {
      // production
      production.push(site);
    } else if (deploy.production != null && deploy.production.enabled !== false) {
      // production, with merged settings
      production.push(merge(deploy.production, site));
    }
  });

  const allSites = [...[...staging, ...production].reduce((map, site) => {
    const id = JSON.stringify(site);
    if (!map.has(id)) map.set(id, site);
    return map;
  }, new Map()).values()];

  // write the global CI file.
  fs.writeFileSync(path.resolve(cwd, folder, './node-ci.yml'), ci);
  log(`wrote file ${path.join(folder, './node-ci.yml')}`);

  if (!allSites.length) {
    log('no deployable websites were found -- no additional workflows were written');
  }

  write(allSites, './integration-tests.yml', integrationTests);
  write(staging, './deploy-staging.yml', deployStaging);
  write(production, './deploy-production.yml', deployProduction);
};
