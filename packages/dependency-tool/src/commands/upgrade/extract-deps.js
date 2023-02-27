const { getAsObject } = require('@parameter1/base-cms-object-path');
const depTypes = require('./dep-types');
const testPackageName = require('./test-package-name');

const { keys } = Object;

module.exports = (pkg) => depTypes.reduce((map, depType) => {
  keys(getAsObject(pkg, depType))
    .filter(testPackageName)
    .forEach((name) => {
      const v = pkg[depType][name];
      const key = `${name}@${v}`;
      map.set(key, { name, v });
    });
  return map;
}, new Map());
