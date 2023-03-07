module.exports = function getReturnType(type) {
  if (type.ofType) return getReturnType(type.ofType);
  return type;
}
