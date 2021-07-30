const { isFunction: isFn } = require('@parameter1/base-cms-utils');

class MarkoWebSearchQueryParam {
  constructor({
    name,
    type,
    defaultValue,
    validator,
    filter,
    toInput,
    fromInput,
  } = {}) {
    this.name = name;
    this.type = type;
    this.defaultValue = defaultValue;
    this.validator = validator;
    this.filter = filter;
    this.toInput = toInput;
    this.fromInput = fromInput;
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

  toQueryValue(input, $markoWebSearch) {
    const { fromInput, filter, validator } = this;
    const defaultValue = this.getDefaultValue();

    let v = input;
    if (v == null) v = defaultValue;
    if (isFn(filter)) v = filter(v);
    const isValid = isFn(validator) ? validator(v, $markoWebSearch) : true;
    if (!isValid) v = defaultValue;
    if (this.isDefaultValue(v)) return null;
    if (isFn(fromInput)) v = fromInput(v);
    return v;
  }

  isDefaultValue(input) {
    const defaultValue = this.getDefaultValue();
    return this.areInputsEqual(input, defaultValue);
  }

  areInputsEqual(input1, input2) {
    if (this.isArray()) {
      return input1.sort().join('') === input2.sort().join('');
    }
    return input1 === input2;
  }

  getDefaultValue() {
    const { defaultValue } = this;
    return (isFn(defaultValue)) ? defaultValue() : defaultValue;
  }

  isArray() {
    return this.type === Array;
  }
}

module.exports = MarkoWebSearchQueryParam;
