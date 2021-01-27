module.exports = (value) => {
  const falsey = ['false', '0'];
  if (falsey.includes(value)) return false;
  return Boolean(value);
};
