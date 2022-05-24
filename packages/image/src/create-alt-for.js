const { titleize } = require('@parameter1/base-cms-inflector');
const { htmlEntities, stripHtml } = require('@parameter1/base-cms-html');

const altFrom = (value = '') => {
  if (!value) return '';
  const v = String(value);
  const pos = v.lastIndexOf('.');
  if (pos === -1) return v;
  const offset = v.length - pos;
  if (offset < 6) {
    const replaced = v.replace(v.substring(pos), '');
    const titleized = titleize(replaced);
    return titleized.replace(/\./g, ' ');
  }
  return v;
};

const clean = v => htmlEntities.encode(stripHtml(v));

module.exports = ({
  displayName,
  caption,
  name,
  fileName,
} = {}, { prepend, append } = {}) => {
  if (prepend) {
    if (displayName) return `${prepend} ${clean(displayName)}`;
    if (caption) return `${prepend} ${clean(caption)}`;
    if (name) return `${prepend} ${clean(altFrom(name))}`;
    return `${prepend} ${clean(altFrom(fileName))}`;
  }
  if (append) {
    if (displayName) return `${clean(displayName)} ${append}`;
    if (caption) return `${clean(caption)} ${append}`;
    if (name) return `${clean(altFrom(name))} ${append}`;
    return `${clean(altFrom(fileName))} ${append}`;
  }
  if (displayName) return clean(displayName);
  if (caption) return clean(caption);
  if (name) return clean(altFrom(name));
  return clean(altFrom(fileName));
};
