const { getAsObject } = require('@parameter1/base-cms-object-path');

module.exports = (params = {}) => {
  const { name } = params;
  const inputConfig = getAsObject(params, 'inputConfig');
  const globalConfig = getAsObject(params, 'globalConfig');

  return ['on', 'requestFrame', 'targetTag'].reduce((o, prop) => {
    // check for specific value for the provided script name, e.g. `{ googletag.on: 'load' }`
    const namedProp = `${name}.${prop}`;
    if (globalConfig[namedProp] != null) return { ...o, [prop]: globalConfig[namedProp] };
    // then check for a global (all scripts) prop, e.g. `{ on: 'never' }`
    if (globalConfig[prop] != null) return { ...o, [prop]: globalConfig[prop] };
    // otherwise, return the local/specific config value.
    return { ...o, [prop]: inputConfig[prop] };
  }, {});
};
