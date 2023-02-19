const path = require('path');
const { unlink } = require('fs').promises;

/**
 * Deletes the compiled marko file for the corresponding template file.
 *
 * @param {string} templateFile The template file to find the compiled file for
 * @param {object} options
 * @param {boolean} [options.throwOnNotFound=true] Whether to throw an error when the file
 *                                                 is not found
 */
module.exports = async (templateFile, { throwOnNotFound = true } = {}) => {
  if (!path.isAbsolute(templateFile)) throw new Error('Marko template files must be absolute.');
  const compiledFile = `${templateFile}.js`;
  try {
    await unlink(compiledFile);
  } catch (e) {
    if (e.code === 'ENOENT' && !throwOnNotFound) return;
    throw e;
  }
};
