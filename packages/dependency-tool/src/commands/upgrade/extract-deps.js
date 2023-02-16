const { getAsObject } = require('@parameter1/base-cms-object-path');
const depTypes = require('./dep-types');

const { keys } = Object;

module.exports = pkg => depTypes.reduce((map, depType) => {
  keys(getAsObject(pkg, depType))
    .filter(name => /^@parameter1\/base-cms-/.test(name))
    .forEach((name) => {
      const v = pkg[depType][name];
      const key = `${name}@${v}`;
      map.set(key, { name, v });
    });
  return map;
}, new Map());
