const { getAsObject } = require('@parameter1/base-cms-object-path');
const { asObject } = require('@parameter1/base-cms-utils');
const buildQueryString = require('../utils/build-query-string');

module.exports = ({ obj, req }) => {
  const issue = asObject(obj);
  const publication = getAsObject(issue, 'publication');
  return {
    event: 'page_view',
    page_type: 'magazine-issue',
    canonical_path: issue.canonicalPath,
    query_string: buildQueryString({ req }),
    issue: {
      id: issue.id,
      name: issue.name,
      mailed: issue.mailed ? new Date(issue.mailed).toISOString() : undefined,
    },
    publication: {
      id: publication.id,
      name: publication.name,
    },
  };
};
