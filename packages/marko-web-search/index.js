const { isFunction: isFn } = require('@parameter1/base-cms-utils');

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
    const def = this.config.queryParams.getDefinition(name);
    const { toInput, validator } = def;
    const value = isFn(toInput) ? toInput(query[name]) : query[name];
    const isValid = isFn(validator) ? validator(value, query) : true;
    if (isValid) return value;
    return isFn(def.default) ? def.default() : def.default;
  }
}

module.exports = MarkoWebSearch;
