module.exports = ({ width = 350, image } = {}) => {
  const { cropRectangle } = image;
  if (cropRectangle) {
    const { width: w, height: h } = cropRectangle;
    if (w && w > 0 && h && h > 0) {
      return Math.round((width / w) * h);
    }
  }
  return undefined;
};
