const { buildImgixUrl } = require('@parameter1/base-cms-image');

const stringifyAttrs = (attrs) => Object.keys(attrs).reduce((arr, key) => {
  const value = attrs[key];
  if (value) arr.push(`${key}="${value}"`);
  return arr;
}, []).join(' ');

const buildWrapperClass = ({ caption, credit }) => {
  const classes = [];
  if (caption) classes.push('image-with-caption');
  if (credit) classes.push('image-with-credit');
  return classes.join(' ');
};

module.exports = (tag, { config } = {}, { lazyloadImages } = {}) => {
  const lazyload = lazyloadImages == null ? config.lazyloadImages() : lazyloadImages;
  const src = tag.get('src');
  const alt = tag.get('alt');
  const caption = tag.get('caption');
  const credit = tag.get('credit');
  const align = tag.get('align');

  const width = tag.get('width');
  const height = tag.get('height');

  const wrapperClass = buildWrapperClass({ caption, credit });

  const attrs = {
    'data-embed-type': tag.type,
    'data-embed-id': tag.id,
    'data-embed-align': align,
    ...(wrapperClass && { class: wrapperClass }),
  };

  const minWidth = 400;
  const maxWidth = (align) ? minWidth : 700;

  const maxSrcset = `${buildImgixUrl(src, { w: maxWidth })}, ${buildImgixUrl(src, { w: maxWidth, dpr: 2 })} 2x`;

  const sources = [
    {
      srcset: lazyload ? null : maxSrcset,
      'data-srcset': lazyload ? maxSrcset : null,
      media: '(min-width: 576px)',
    },
  ].map((source) => `<source ${stringifyAttrs(source)}>`).join('');

  const minSrc = buildImgixUrl(src, { w: minWidth });
  const minSrcset = `${buildImgixUrl(src, { w: minWidth, dpr: 2 })} 2x`;

  const transparentImg = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  const imgAttrs = {
    class: lazyload ? 'lazyload' : null,
    src: lazyload ? transparentImg : minSrc,
    srcset: lazyload ? null : minSrcset,
    'data-src': lazyload ? minSrc : null,
    'data-srcset': lazyload ? minSrcset : null,
    'data-image-id': tag.id,
    alt,
    width: (width && height) ? minWidth : null,
    height: (height && height) ? Math.round((height / width) * minWidth) : null,
  };

  const captionElement = caption ? `<span class="caption">${caption}</span>` : '';
  const creditElement = credit ? `<span class="credit">${credit}</span>` : '';

  const img = `<img ${stringifyAttrs(imgAttrs)}>`;
  const picture = `<picture>${sources}${img}${captionElement}${creditElement}</picture>`;
  return `<span ${stringifyAttrs(attrs)}>${picture}</span>`;
};
