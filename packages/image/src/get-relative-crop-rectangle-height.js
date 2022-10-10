module.exports = ({ width = 350, cropRectangle = {} } = {}) => {
  if (!cropRectangle) return null;
  const { width: w, height: h } = cropRectangle;
  if (!w || !h) return null;
  return Math.round((width / w) * h);
};
