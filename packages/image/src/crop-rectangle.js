class CropRectangle {
  constructor({
    x,
    y,
    width,
    height,
    cropped,
  } = {}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.cropped = cropped;
  }

  isCropped() {
    return this.cropped;
  }

  notCropped() {
    return !this.cropped;
  }

  toString() {
    return ['x', 'y', 'width', 'height'].map(key => this[key]).join(',');
  }
}

/**
 * Generates a crop rectangle for the given image width, height
 * and crop dimensions.
 *
 * Uses the same scaling logic as Base Platform to properly calculate
 * the crop area.
 */
module.exports = ({ width, height, cropDimensions }) => {
  if (!cropDimensions || !width || !height) {
    return new CropRectangle({
      x: 0,
      y: 0,
      width,
      height,
      cropped: false,
    });
  }
  // @see Cygnus\ApplicationBundle\Apps\Management\Controller::cropImageAction
  const scale = width / 640;
  const {
    x1,
    x2,
    y1,
    y2,
  } = ['x1', 'x2', 'y1', 'y2'].reduce((o, key) => {
    const v = Math.round(cropDimensions[key] * scale);
    return { ...o, [key]: v };
  }, {});

  if (!x1 || !x2 || !y1 || !y2) {
    return new CropRectangle({
      x: 0,
      y: 0,
      width,
      height,
      cropped: false,
    });
  }

  return new CropRectangle({
    x: x1,
    y: y1,
    width: x2 - x1,
    height: y2 - y1,
    cropped: true,
  });
};
