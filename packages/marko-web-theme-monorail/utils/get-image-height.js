module.exports = ({ width = 350, image } = {}) => {
  if (
    image.cropRectangle.width && image.cropRectangle.width > 0
    && image.cropRectangle.height && image.cropRectangle.height > 0
  ) {
    return Math.round((width / image.cropRectangle.width) * image.cropRectangle.height);
  }
  return undefined;
};
