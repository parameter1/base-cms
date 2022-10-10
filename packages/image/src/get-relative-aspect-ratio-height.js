module.exports = (width, ar, delimiter = ':') => {
  const [x, y] = ar.split(delimiter);
  const r = x / y;
  return Math.round(width / r);
};
