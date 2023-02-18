const { getProfileMS } = require('@parameter1/base-cms-marko-web-modern-utils');
const compile = require('@parameter1/base-cms-marko-web-modern-lib/compile');
const { deleteCompiledFiles } = require('@parameter1/base-cms-marko-web-modern-lib/utils');
const log = require('fancy-log');

/**
 *
 * @param {object} params
 * @param {string} params.cwd The current working directory.
 * @param {string[]} [params.dirs] Additional directories, relative to the cwd, to compile. This is
 *                                 usually set when shared/global packages are used along with the
 *                                 site. For example, if the cwd was `sites/foo.com` and a global
 *                                 a global package existed in `packages/global` you would add an
 *                                 `../packages/global` entry
 */
module.exports = async ({ cwd, dirs, clean } = {}) => {
  if (clean) {
    log('deleting all compiled Marko templates...');
    await deleteCompiledFiles(cwd, { dirs });
    log('compiled templates deleted');
  }
  log('compiling marko templates...');
  const start = process.hrtime();
  await compile.all(cwd, { dirs });
  log(`marko templates compiled in ${getProfileMS(start)}ms`);
};
