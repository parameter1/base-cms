const { asArray } = require('@parameter1/base-cms-utils');

const parseJSON = (value) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
};

const getContentTypeFilters = ({ query, filters }) => {
  const { contentTypeMap } = filters;
  const contentTypes = asArray(parseJSON(query.contentTypes));
  return contentTypes.filter(type => contentTypeMap.has(type));
};

const getSectionIdFilters = ({ query, filters }) => {
  const { sectionIdMap } = filters;
  const sectionIds = asArray(parseJSON(query.sectionIds))
    .map(v => parseInt(v, 10))
    .filter(id => sectionIdMap.has(id));
  return sectionIds;
};

const getSearchQueryFilter = ({ query }) => {
  const { searchQuery } = query;
  return searchQuery ? searchQuery.trim() : null;
};

module.exports = ({ config, template } = {}) => (req, res) => {
  const { filters, pageLimit } = config;
  const { query } = req;
  const page = parseInt(query.page, 10) || 1;

  const getTotalPages = ({ totalCount }) => Math.ceil(totalCount / pageLimit);

  const $search = {
    config,
    searchQuery: getSearchQueryFilter({ query }),
    page,
    limit: pageLimit,
    skip: page < 1 ? 0 : pageLimit * (page - 1),
    selectedFilters: {
      contentTypes: getContentTypeFilters({ query, filters }),
      sectionIds: getSectionIdFilters({ query, filters }),
    },
    getTotalPages,
    getNextPage: ({ totalCount }) => {
      const total = getTotalPages({ totalCount });
      if (page < total) return page + 1;
      return null;
    },
    prevPage: page > 1 ? page - 1 : null,
  };
  return res.marko(template, { $search });
};
