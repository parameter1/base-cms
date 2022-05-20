const { xmlEntities: xml } = require('@parameter1/base-cms-html');

module.exports = ({
  seoTitle,
  teaser,
  siteContext,
  publishedDate,
  authors,
  primarySection,
  images,
  embedSrc,
}, website) => {
  const { url } = siteContext;
  const parts = [
    `<title>${xml.encode(seoTitle)}</title>`,
    `<link>${url}</link>`,
    `<guid isPermaLink="true">${url}</guid>`,
  ];
  if (teaser) parts.push(`<description>${xml.encode(teaser)}</description>`);
  if (publishedDate) parts.push(`<pubDate>${publishedDate}</pubDate>`);
  const authorNodes = authors.map(authorEdge => authorEdge.node);
  let authorsString = '';
  if (authorNodes.length) {
    authorNodes.forEach((authorNode, index) => {
      const currentAuthorString = `${authorNode.publicEmail} (${authorNode.firstName} ${authorNode.lastName})`;
      if (authorNode.publicEmail) {
        if (index) {
          authorsString += `, ${currentAuthorString}`;
        } else {
          authorsString += currentAuthorString;
        }
      }
    });
    if (authorsString) parts.push(`<author>${authorsString}</author>`);
  }
  if (primarySection && primarySection.alias !== 'home') {
    parts.push(`<category domain="${website.origin}">${xml.encode(primarySection.fullName.replace('>', '/'))}</category>`);
  }
  const imageNodes = images.map(imageEdge => imageEdge.node);
  if (imageNodes.length) {
    imageNodes.forEach((imageNode) => {
      parts.push(`<media:content url=${imageNode.src} medium="image" />`);
    });
  }
  if (embedSrc) {
    parts.push(`<media:content url=${embedSrc} medium="video" />`);
  }
  return `<item>${parts.join('')}</item>`;
};
