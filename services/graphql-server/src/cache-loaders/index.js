const createSectionLoader = require('./create-section-loader');

/**
 *
 * @param {object} params
 * @param {import("@parameter1/base-cms-db/src/basedb.js")} params.basedb
 * @param {Function} [params.onCacheError]
 * @param {number} [params.refreshMaxAge=3600]
 * @param {boolean} [params.debug]
 */
module.exports = ({
  basedb,
  onCacheError,
  refreshMaxAge = 3600,
  debug = process.env.NODE_ENV === 'development',
}) => ({
  websiteSection: createSectionLoader({
    basedb,
    onCacheError,
    refreshMaxAge,
    debug,
  }),
});
