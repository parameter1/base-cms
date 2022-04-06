const buildImgixUrl = require('./build-imgix-url');

module.exports = (host, image, options, defaultOptions) => {
  const {
    filePath,
    fileName,
    cropDimensions,
  } = image;
  if (!fileName || !filePath) {
    return buildImgixUrl(`https://${host}/asset-is-missing-file-name-or-path`, options, defaultOptions);
  }
  const path = cropDimensions && cropDimensions.aspectRatio ? `${filePath}/${cropDimensions.aspectRatio}` : filePath;
  const src = `https://${host}/${path}/${fileName}`;
  return buildImgixUrl(src, options, defaultOptions);
};
