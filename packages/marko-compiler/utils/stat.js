const { statSync, promises } = require('fs');

const { stat } = promises;

const handleError = (e, { throwOnNotFound }) => {
  if (e.code === 'ENOENT') {
    if (throwOnNotFound) throw e;
    return null;
  }
  throw e;
};

module.exports = {
  /**
   *
   * @param {string} path The file path to retrieve stats for
   * @param {object} options
   * @param {boolean} [options.throwOnNotFound=true] Whether to throw an error when the file
   *                                                 is not found
   */
  async: async (path, { throwOnNotFound = true } = {}) => {
    try {
      const stats = await stat(path);
      return stats;
    } catch (e) {
      return handleError(e, { throwOnNotFound });
    }
  },

  /**
   *
   * @param {string} path The file path to retrieve stats for
   * @param {object} options
   * @param {boolean} [options.throwOnNotFound=true] Whether to throw an error when the file
   *                                                 is not found
   */
  sync: (path, { throwOnNotFound = true } = {}) => {
    try {
      return statSync(path);
    } catch (e) {
      return handleError(e, { throwOnNotFound });
    }
  },
};
