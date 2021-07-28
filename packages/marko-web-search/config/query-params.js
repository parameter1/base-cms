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
        type: Number,
        default: resultsPerPage.default,
        validator: v => (v >= resultsPerPage.min && v <= resultsPerPage.max),
        toInput: v => parseInt(v, 10),
        onParamUpdate: resetPage,
      })
      .add('page', {
        type: Number,
        default: 1,
        validator: (v, search) => {
          if (v < 1) return false;
          const limit = search.getInputValueFor('limit');
          return ((v * limit) <= 10000);
        },
        toInput: v => parseInt(v, 10),
      })
      .add('searchQuery', {
        type: String,
        default: '',
        onParamUpdate: resetPage,
      })
      .add('contentTypes', {
        isFilter: true,
        type: Array,
        default: () => [],
        validator: v => contentTypeIdMap.has(v),
        onParamUpdate: resetPage,
        toInput: toStringArrayInput,
        fromInput: fromArrayInput,
      })
      .add('assignedToWebsiteSectionIds', {
        isFilter: true,
        type: Array,
        default: () => [],
        validator: v => assignedToWebsiteSectionIdMap.has(v),
        onParamUpdate: resetPage,
        toInput: toIntArrayInput,
        fromInput: fromArrayInput,
      });
  }

  add(name, param) {
    this.params.set(name, { ...param, name });
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
