class MarkoWebSearch {
  constructor({ config, query = {} } = {}) {
    this.config = config;
    this.query = query;
    this.input = this.getAllInputValues();
  }

  buildURLSearchParams(newValues = {}) {
    return new URLSearchParams(this.queryParamNames.reduce((o, name) => {
      const value = this.getQueryStringValueFor(name, newValues[name]);
      if (value == null) return o;
      return { ...o, [name]: value };
    }, {}));
  }

  buildQueryString(newValues = {}) {
    const params = this.buildURLSearchParams(newValues);
    const str = `${params}`;
    return str ? `?${str}` : '';
  }

  /**
   * Gets all component (internal) input values from the current Express request query.
   *
   * Invalid values are reset to the definition's default value.
   * @param {object} query The Express request query object.
   * @returns {object}
   */
  getAllInputValues() {
    return this.queryParamNames.reduce((o, name) => {
      const value = this.getInputValueFor(name);
      return { ...o, [name]: value };
    }, {});
  }

  /**
   * Gets the component (internal) input value for the provided parameter name and
   * current Express request query.
   *
   * Invalid values are reset to the definition's default value.
   *
   * @param {string} name The query parameter name.
   * @returns {*}
   */
  getInputValueFor(name) {
    const definition = this.config.queryParams.getDefinition(name);
    return definition.toInputValue(this.query[name], this);
  }

  /**
   *
   * @param {string} name The query parameter name
   * @param {*} [newValue] The optional new value to replace
   * @returns {string?}
   */
  getQueryStringValueFor(name, newValue) {
    const definition = this.config.queryParams.getDefinition(name);
    const value = typeof newValue === 'undefined' ? this.input[name] : newValue;
    return definition.toQueryValue(value, this);
  }

  get queryParamNames() {
    return this.config.queryParams.names();
  }

  page() {
    return this.getInputValueFor('page');
  }

  limit() {
    return this.getInputValueFor('limit');
  }

  skip() {
    return this.limit() * (this.page() - 1);
  }

  totalPages(totalCount = 0) {
    const count = totalCount > 10000 ? 10000 : totalCount;
    return Math.ceil(count / this.limit());
  }

  nextPage(totalCount = 0) {
    const page = this.page();
    const total = this.totalPages(totalCount);
    return page < total ? page + 1 : null;
  }

  prevPage() {
    const page = this.page();
    return page > 1 ? page - 1 : null;
  }
}

module.exports = MarkoWebSearch;
