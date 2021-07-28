const { isFunction: isFn } = require('@parameter1/base-cms-utils');

class MarkoWebSearchQueryParam {
  constructor({
    name,
    defaultValue,
    validator,
    filter,
    toInput,
    fromInput,
    onParamUpdate,
  } = {}) {
    this.name = name;
    this.defaultValue = defaultValue;
    this.validator = validator;
    this.filter = filter;
    this.toInput = toInput;
    this.fromInput = fromInput;
    this.onParamUpdate = onParamUpdate;
  }

  toInputValue(value, $markoWebSearch) {
    const { toInput, filter, validator } = this;
    const defaultValue = this.getDefaultValue();

    let input = isFn(toInput) ? toInput(value) : value;
    if (input == null) input = defaultValue;
    if (isFn(filter)) input = filter(input);
    const isValid = isFn(validator) ? validator(input, $markoWebSearch) : true;
    return isValid ? input : defaultValue;
  }

  getDefaultValue() {
    const { defaultValue } = this;
    return (isFn(defaultValue)) ? defaultValue() : defaultValue;
  }
}

module.exports = MarkoWebSearchQueryParam;
