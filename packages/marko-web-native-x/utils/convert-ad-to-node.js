const convertAdToContent = require('./convert-ad-to-content');

module.exports = (ad, { sectionName = 'Sponsored' } = {}) => {
  const node = convertAdToContent(ad, { sectionName });
  return { node, attrs: ad.attributes.container, linkAttrs: ad.attributes.link };
};
