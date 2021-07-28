const MarkoWebSearchQueryParam = require('./param');

const { isArray } = Array;

const resetPage = ({ query } = {}) => {
  const q = { ...query };
  delete q.page;
  return q;
};

const unqArray = array => [...new Set(array)];

const toArrayInput = (str, mapFunc) => {
  if (!str) return undefined;
  const trimmed = str.trim();
  if (!trimmed) return undefined;
  return unqArray(trimmed.split(',').map(mapFunc).filter(v => v));
};

const fromArrayInput = (arr) => {
  if (!isArray(arr) || !arr.length) return null;
  return unqArray(arr.sort().filter(i => i)).join(',');
};

const toIntArrayInput = arr => toArrayInput(arr, v => parseInt(v, 10));
const toStringArrayInput = arr => toArrayInput(arr, v => v.trim());


class MarkoWebSearchQueryParamConfig {
  constructor({
    resultsPerPage = {},
    contentTypeIds = [],
    assignedToWebsiteSectionIds = [],
  } = {}) {
    this.params = new Map();

    const contentTypeIdMap = contentTypeIds.reduce((m, id) => {
      m.set(id, true);
      return m;
    }, new Map());

    const assignedToWebsiteSectionIdMap = assignedToWebsiteSectionIds.reduce((m, id) => {
      m.set(id, true);
      return m;
    }, new Map());

    this
      .add('limit', {
        defaultValue: resultsPerPage.default,
        validator: v => (v >= resultsPerPage.min && v <= resultsPerPage.max),
        toInput: v => parseInt(v, 10),
        onParamUpdate: resetPage,
      })
      .add('page', {
        defaultValue: 1,
        validator: (v, search) => {
          if (v < 1) return false;
          const limit = search.getInputValueFor('limit');
          return ((v * limit) <= 10000);
        },
        toInput: v => parseInt(v, 10),
      })
      .add('searchQuery', {
        defaultValue: '',
        onParamUpdate: resetPage,
      })
      .add('contentTypes', {
        defaultValue: () => [],
        filter: types => types.filter(type => contentTypeIdMap.has(type)),
        validator: types => types.every(type => contentTypeIdMap.has(type)),
        onParamUpdate: resetPage,
        toInput: toStringArrayInput,
        fromInput: fromArrayInput,
      })
      .add('assignedToWebsiteSectionIds', {
        defaultValue: () => [],
        filter: ids => ids.filter(id => assignedToWebsiteSectionIdMap.has(id)),
        validator: ids => ids.every(id => assignedToWebsiteSectionIdMap.has(id)),
        onParamUpdate: resetPage,
        toInput: toIntArrayInput,
        fromInput: fromArrayInput,
      });
  }

  add(name, param) {
    this.params.set(name, new MarkoWebSearchQueryParam({ ...param, name }));
    return this;
  }

  names() {
    return [...this.params.keys()];
  }

  getDefinition(name) {
    const param = this.params.get(name);
    if (!param) throw new Error(`No query parameter definition was found for ${name}`);
    return param;
  }
}

module.exports = MarkoWebSearchQueryParamConfig;
