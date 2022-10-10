const buildImgixUrl = require('./build-imgix-url');
const createAltFor = require('./create-alt-for');
const createCaptionFor = require('./create-caption-for');
const createSrcFor = require('./create-src-for');
const cropRectangle = require('./crop-rectangle');
const getRelativeAspectRatioHeight = require('./get-relative-aspect-ratio-height');
const getRelativeAspectRatioWidth = require('./get-relative-aspect-ratio-width');
const getRelativeCropRectangleHeight = require('./get-relative-crop-rectangle-height');

module.exports = {
  buildImgixUrl,
  createAltFor,
  createCaptionFor,
  createSrcFor,
  cropRectangle,
  getRelativeAspectRatioHeight,
  getRelativeAspectRatioWidth,
  getRelativeCropRectangleHeight,
};
