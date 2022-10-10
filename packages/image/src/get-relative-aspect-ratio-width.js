module.exports = (height, ar, delimiter = ':') => {
  const [x, y] = ar.split(delimiter);
  const r = x / y;
  return Math.round(height * r);
};
