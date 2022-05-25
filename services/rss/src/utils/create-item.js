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
  const authorStrings = authors.reduce((arr, { node }) => {
    const { publicEmail, firstName, lastName } = node;

    const nameParts = [];
    if (firstName) nameParts.push(firstName);
    if (lastName) nameParts.push(firstName);

    const authorParts = [];
    if (publicEmail) authorParts.push(publicEmail);
    if (nameParts.length) authorParts.push(nameParts.join(' '));

    if (authorParts.length) arr.push(authorParts.join(' '));

    return arr;
  }, []);
  if (authorStrings.length) parts.push(`<author>${authorStrings.join(', ')}</author>`);
  if (primarySection && primarySection.alias !== 'home') {
    parts.push(`<category domain="${website.origin}">${xml.encode(primarySection.fullName.replace('>', '/'))}</category>`);
  }
  const imageMediaTags = images.reduce((arr, { node }) => {
    const { src } = node;
    if (src) arr.push(`<media:content url="${node.src}" medium="image" />`);
    return arr;
  }, []);
  if (imageMediaTags.length) parts.push(...imageMediaTags);
  if (embedSrc) parts.push(`<media:content url="${embedSrc}" medium="video" />`);
  return `<item>${parts.join('')}</item>`;
};
