const { extractEmbeddedTags } = require('@parameter1/base-cms-embedded-media');
const { createAltFor, createSrcFor, createCaptionFor } = require('@parameter1/base-cms-image');

const defaults = {
  w: '1280',
  fit: 'max',
  auto: 'format,compress',
};

module.exports = async (body, { imageHost, imageAttrs, basedb }) => {
  if (!body) return [];
  const imageTags = extractEmbeddedTags(body).filter((tag) => tag.type === 'image');
  return Promise.all(imageTags.map(async (tag) => {
    const image = await basedb.findById('platform.Asset', tag.id, {
      projection: {
        credit: 1,
        caption: 1,
        displayName: 1,
        name: 1,
        fileName: 1,
        filePath: 1,
        cropDimensions: 1,
        width: 1,
        height: 1,
      },
    });
    if (!image) {
      tag.setValid(false);
      return tag;
    }

    tag.set('alt', createAltFor(image));
    tag.set('src', createSrcFor(imageHost, image, {
      ...defaults,
      ...imageAttrs,
    }));
    tag.set('caption', createCaptionFor(image.caption));
    tag.set('credit', image.credit);
    if (image.width) tag.set('width', String(image.width));
    if (image.height) tag.set('height', String(image.height));
    return tag;
  }));
};
