const { getAsObject, getAsArray, get } = require('@parameter1/base-cms-object-path');
const { asObject } = require('@parameter1/base-cms-utils');
const buildQueryString = require('../utils/build-query-string');

module.exports = ({ type, obj, req }) => {
  const content = asObject(obj);
  const company = getAsObject(content, 'company');
  const section = getAsObject(content, 'primarySection');
  const hierarchy = getAsArray(section, 'hierarchy').map((s) => ({
    id: s.id,
    name: s.name,
    alias: s.alias,
  }));
  return {
    page_type: type,
    canonical_path: get(content, 'siteContext.path'),
    query_string: buildQueryString({ req }),
    content: {
      id: content.id,
      type: content.type,
      name: content.name,
      published: content.published ? new Date(content.published).toISOString() : undefined,
      labels: getAsArray(content, 'labels'),
    },
    company: {
      id: company.id,
      name: company.name,
    },
    section: {
      id: section.id,
      name: section.name,
      alias: section.alias,
      fullName: section.fullName,
    },
    section_hierarchy: hierarchy,
  };
};
