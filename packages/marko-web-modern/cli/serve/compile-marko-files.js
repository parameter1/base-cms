const { getProfileMS } = require('@parameter1/base-cms-marko-web-modern-utils');
const compile = require('@parameter1/base-cms-marko-web-modern-lib/compile');
const { deleteCompiledFiles } = require('@parameter1/base-cms-marko-web-modern-lib/utils');

const { log } = console;

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
    log('Deleting all compiled Marko templates...');
    await deleteCompiledFiles(cwd, { dirs });
    log('Compiled templates deleted');
  }
  log('Compiling Marko templates...');
  const start = process.hrtime();
  await compile.all(cwd, { dirs });
  log(`Marko templates compiled in ${getProfileMS(start)}ms`);
};
