const { getAsArray } = require('@parameter1/base-cms-object-path');
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
  const authorStrings = getAsArray(authors, 'edges').reduce((arr, { node }) => {
    const { publicEmail, firstName, lastName } = node;

    if (!publicEmail) return arr;

    const nameParts = [];
    if (firstName) nameParts.push(firstName);
    if (lastName) nameParts.push(lastName);

    const authorParts = [];
    if (publicEmail) authorParts.push(publicEmail);
    if (nameParts.length) authorParts.push(`(${nameParts.join(' ')})`);

    if (authorParts.length) arr.push(authorParts.join(' '));

    return arr;
  }, []);
  if (authorStrings.length) parts.push(`<author>${authorStrings.join(', ')}</author>`);
  if (primarySection && primarySection.alias !== 'home') {
    parts.push(`<category domain="${website.origin}">${xml.encode(primarySection.fullName.replace('>', '/'))}</category>`);
  }
  const imageMediaTags = getAsArray(images, 'edges').reduce((arr, { node }) => {
    const { src } = node;
    if (src) {
      arr.push(`<media:content url="${src.replace(/&([a-z0-9-_]+=)/gi, '&amp;$1')}" medium="image" />`);
    }
    return arr;
  }, []);
  if (imageMediaTags.length) parts.push(...imageMediaTags);
  if (embedSrc) parts.push(`<media:content url="${embedSrc}" medium="video" />`);
  return `<item>${parts.join('\n')}</item>`;
};
