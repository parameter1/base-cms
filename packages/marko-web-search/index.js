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
   * @param {object} query The Express request query object.
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

  getCurrentPage() {
    return this.getInputValueFor('page');
  }

  getLimit() {
    return this.getInputValueFor('limit');
  }

  getSkip() {
    return this.getLimit() * (this.getCurrentPage() - 1);
  }

  getTotalPages(totalCount = 0) {
    const count = totalCount > 10000 ? 10000 : totalCount;
    return Math.ceil(count / this.getLimit());
  }

  getNextPage(totalCount = 0) {
    const page = this.getCurrentPage();
    const total = this.getTotalPages(totalCount);
    return page < total ? page + 1 : null;
  }

  getPrevPage() {
    const page = this.getCurrentPage();
    return page > 1 ? page - 1 : null;
  }
}

module.exports = MarkoWebSearch;
