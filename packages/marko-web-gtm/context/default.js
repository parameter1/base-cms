const { asObject } = require('@parameter1/base-cms-utils');
const buildQueryString = require('../utils/build-query-string');

module.exports = ({ type, obj, req }) => {
  const o = asObject(obj);
  return {
    event: 'page_view',
    page_type: type,
    canonical_path: o.canonicalPath || req.path,
    query_string: buildQueryString({ req }),
  };
};
