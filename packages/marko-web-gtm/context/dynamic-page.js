const { get } = require('@parameter1/base-cms-object-path');
const { asObject } = require('@parameter1/base-cms-utils');
const buildQueryString = require('../utils/build-query-string');

module.exports = ({ obj, req }) => {
  const page = asObject(obj);
  return {
    event: 'page_view',
    page_type: 'dynamic-page',
    canonical_path: get(page, 'siteContext.path'),
    query_string: buildQueryString({ req }),
    page: {
      id: page.id,
      name: page.name,
      alias: page.alias,
    },
  };
};
