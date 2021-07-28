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
}

module.exports = MarkoWebSearch;
