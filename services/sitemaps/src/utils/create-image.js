const { xmlEntities: xml } = require('@parameter1/base-cms-html');

module.exports = ({
  loc,
  caption,
  title,
}) => {
  const parts = [];
  if (caption) parts.push(`<image:caption>${xml.encode(caption)}</image:caption>`);
  if (title) parts.push(`<image:title>${xml.encode(title)}</image:title>`);
  return `<image:image><image:loc>${loc}</image:loc>${parts.join('')}</image:image>`;
};
