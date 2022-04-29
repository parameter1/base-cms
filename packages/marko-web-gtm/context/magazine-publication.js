const { asObject } = require('@parameter1/base-cms-utils');
const buildQueryString = require('../utils/build-query-string');

module.exports = ({ obj, req }) => {
  const publication = asObject(obj);
  return {
    event: 'page_view',
    page_type: 'magazine-publication',
    canonical_path: publication.canonicalPath,
    query_string: buildQueryString({ req }),
    publication: {
      id: publication.id,
      name: publication.name,
    },
  };
};
