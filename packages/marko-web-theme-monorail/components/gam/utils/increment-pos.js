module.exports = ({ res, position, inc = 1 } = {}) => {
  // Do nothing if no position key is passed.
  if (!position) return position;
  res.locals.pos = res.locals.pos || {};

  const val = parseInt(res.locals.pos[position], 10) || 0;
  const n = inc + val;
  res.locals.pos[position] = n;

  return `${position}|${n}`;
};
