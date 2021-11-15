const { statSync } = require('fs');

module.exports = (path, { throwOnNotFound = true } = {}) => {
  try {
    return statSync(path);
  } catch (e) {
    if (e.code === 'ENOENT') {
      if (throwOnNotFound) throw e;
      return null;
    }
    throw e;
  }
};
