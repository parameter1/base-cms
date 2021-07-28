class MarkoWebSearch {
  constructor({ config, query = {} } = {}) {
    this.config = config;
    this.query = query;
  }

  /**
   * Gets all component (internal) input values from the current Express request query.
   *
   * Invalid values are reset to the definition's default value.
   * @returns {object}
   */
  getAllInputValues() {
    return this.config.queryParams.names().reduce((o, name) => {
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
   * @param {string} name The query parameter name
   * @returns {*}
   */
  getInputValueFor(name) {
    const { query } = this;
    const definition = this.config.queryParams.getDefinition(name);
    return definition.toInputValue(query[name], this);
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
