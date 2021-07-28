const build = (opts) => {
  const q = new URLSearchParams(opts);
  const str = `${q}`;
  return str ? `?${str}` : '';
};

const set = (key, value, opts) => build({
  ...opts,
  [key]: value,
});

const unset = (key, opts) => {
  const o = { ...opts };
  delete o[key];
  return build(o);
};

const setPage = (value, opts) => {
  if (value && value > 1) return set('page', value, opts);
  return unset('page', opts);
};

const setQuery = (value, opts) => {
  if (!value) return unset('query', opts);
  const trimmed = value.trim();
  return trimmed ? set('query', trimmed, opts) : unset('query', opts);
};

const buildSet = (key, s, opts) => {
  const arr = [...s].sort();
  return set(key, JSON.stringify(arr), opts);
};

const setContentType = (current, value, opts) => {
  if (!value || !value.trim()) return build(opts);
  const values = new Set(current);
  values.add(value.trim());
  return buildSet('contentTypes', values, opts);
};

const setSectionId = (current, value, opts) => {
  if (!value) return build(opts);
  const parsed = parseInt(value, 10);
  if (!parsed || parsed < 1) return build(opts);
  const values = new Set(parsed);
  values.add(value);
  return buildSet('sectionIds', values, opts);
};


/**
 *
 * @param {object} params
 * @param {object} params.$search The search-state middleware object
 * @param {string} params.key The search param key to push a new value into
 * @param {*} params.value The param value to set/push
 */
module.exports = ({
  $search,
  key,
  value,
} = {}) => {
  const { page, query } = $search;
  const { contentTypes, sectionIds } = $search.selectedFilters;
  const opts = {
    ...(query && { query }),
    ...(page > 1 && { page }),
    ...(contentTypes.length && { contentTypes: JSON.stringify(contentTypes) }),
    ...(sectionIds.length && { sectionIds: JSON.stringify(sectionIds) }),
  };

  if (key === 'page') return setPage(value, opts);
  if (key === 'query') return setQuery(value, opts);
  if (key === 'contentTypes') return setContentType(contentTypes, value, opts);
  if (key === 'setSectionIds') return setSectionId(sectionIds, value, opts);
  return build(opts);
};
