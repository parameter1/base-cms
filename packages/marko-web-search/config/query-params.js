const MarkoWebSearchQueryParam = require('./param');

const { isArray } = Array;

const unqArray = (array) => [...new Set(array)];

const toArrayInput = (str, mapFunc) => {
  if (!str) return undefined;
  const trimmed = str.trim();
  if (!trimmed) return undefined;
  return unqArray(trimmed.split(',').map(mapFunc).filter((v) => v));
};

const fromArrayInput = (arr) => {
  if (!isArray(arr) || !arr.length) return null;
  return unqArray(arr.sort().filter((i) => i)).join(',');
};

const toIntArrayInput = (arr) => toArrayInput(arr, (v) => parseInt(v, 10));
const toStringArrayInput = (arr) => toArrayInput(arr, (v) => v.trim());

const sortFieldSet = new Set(['PUBLISHED', 'SCORE']);
const sortOrderSet = new Set(['DESC', 'ASC']);

class MarkoWebSearchQueryParamConfig {
  constructor({
    resultsPerPage = {},
    contentTypeIds = [],
  } = {}) {
    this.params = new Map();

    const contentTypeIdMap = contentTypeIds.reduce((m, id) => {
      m.set(id, true);
      return m;
    }, new Map());

    this
      .add('limit', {
        type: Number,
        defaultValue: resultsPerPage.default,
        validator: (v) => (v >= resultsPerPage.min && v <= resultsPerPage.max),
        toInput: (v) => parseInt(v, 10),
      })
      .add('page', {
        type: Number,
        defaultValue: 1,
        validator: (v, search) => {
          if (v < 1) return false;
          const limit = search.getInputValueFor('limit');
          return ((v * limit) <= 10000);
        },
        toInput: (v) => parseInt(v, 10),
      })
      .add('searchQuery', {
        type: String,
        defaultValue: '',
      })
      .add('contentTypes', {
        type: Array,
        defaultValue: () => contentTypeIds.slice(),
        filter: (types) => types.filter((type) => contentTypeIdMap.has(type)),
        validator: (types) => types.every((type) => contentTypeIdMap.has(type)),
        toInput: toStringArrayInput,
        fromInput: fromArrayInput,
      })
      .add('assignedToWebsiteSectionIds', {
        type: Array,
        defaultValue: () => [],
        toInput: toIntArrayInput,
        fromInput: fromArrayInput,
      })
      .add('sortField', {
        type: String,
        defaultValue: 'PUBLISHED',
        validator: (v) => sortFieldSet.has(v),
      })
      .add('sortOrder', {
        type: String,
        defaultValue: 'DESC',
        validator: (v) => sortOrderSet.has(v),
      });
  }

  add(name, param) {
    this.params.set(name, new MarkoWebSearchQueryParam({ ...param, name }));
    return this;
  }

  names() {
    return [...this.params.keys()].sort();
  }

  getDefinition(name) {
    const param = this.params.get(name);
    if (!param) throw new Error(`No query parameter definition was found for ${name}`);
    return param;
  }
}

module.exports = MarkoWebSearchQueryParamConfig;
