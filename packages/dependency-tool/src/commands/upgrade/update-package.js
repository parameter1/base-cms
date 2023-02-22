const { set, getAsObject } = require('@parameter1/base-cms-object-path');
const depTypes = require('./dep-types');
const testPackageName = require('./test-package-name');

const { keys } = Object;

module.exports = (toChange, pkg) => {
  depTypes.forEach((depType) => {
    keys(getAsObject(pkg, depType))
      .filter(testPackageName)
      .forEach((name) => {
        const v = pkg[depType][name];
        const key = `${name}@${v}`;
        if (toChange.has(key)) {
          const depPath = `${depType}.${name}`;
          set(pkg, depPath, toChange.get(key));
        }
      });
  });
  return pkg;
};
