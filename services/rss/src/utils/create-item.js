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
  const authorStrings = authors.reduce(authorEdge => authorEdge.node).map((authorEdge) => {
    const { node } = authorEdge;
    return `${node.publicEmail} (${node.firstName} ${node.lastName})`;
  });
  parts.push(`<author>${authorStrings.join(', ')}</author>`);
  if (primarySection && primarySection.alias !== 'home') {
    parts.push(`<category domain="${website.origin}">${xml.encode(primarySection.fullName.replace('>', '/'))}</category>`);
  }
  const imageMediaTags = images.reduce(imageEdge => imageEdge.node).map((imageEdge) => {
    const { node } = imageEdge;
    return `<media:content url=${node.src} medium="image" />`;
  });
  parts.push(...imageMediaTags);
  if (embedSrc) parts.push(`<media:content url=${embedSrc} medium="video" />`);
  return `<item>${parts.join('')}</item>`;
};
