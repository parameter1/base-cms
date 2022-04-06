const fetch = require('node-fetch');
const newrelic = require('../../newrelic');

/**
 * Retrieves width/height information from Imgix and sets to
 * the Asset/Image model. Will only do this when the width or height
 * are missing from the model.
 */
module.exports = async ({
  image,
  host,
  basedb,
}) => {
  const {
    width,
    height,
    filePath,
    fileName,
  } = image;
  if (!filePath || !fileName) return { width: 0, height: 0 };
  if (width && height) return { width, height };
  const url = `https://${host}/${filePath}/${fileName}?fm=json`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Image at ${filePath}/${fileName} ${res.statusText} ID: ${image._id}`);
    }
    const { PixelWidth, PixelHeight } = await res.json();
    const $set = { width: PixelWidth, height: PixelHeight };
    await basedb.updateOne('platform.Asset', { _id: image._id }, { $set });
    return { width: PixelWidth, height: PixelHeight };
  } catch (e) {
    newrelic.noticeError(e);
    return { width: 0, height: 0 };
  }
};
