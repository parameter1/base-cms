module.exports = function hasSelections(paths, introspected) {
  return paths.reduce((o, path) => ({
    ...o, [path]: introspected.has(path),
  }), {});
};
