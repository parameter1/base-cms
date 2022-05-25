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

const strip = v => htmlEntities.encode(stripHtml(v));

const clean = (v, { prepend, append }) => {
  const values = [];
  if (prepend) values.push(strip(prepend));
  values.push((strip(v)));
  if (append) values.push(strip(append));
  return values.join(' ');
};

module.exports = ({
  displayName,
  caption,
  name,
  fileName,
  prepend,
  append,
} = {}) => {
  if (displayName) return clean(displayName, { prepend, append });
  if (caption) return clean(caption, { prepend, append });
  if (name) return clean(altFrom(name), { prepend, append });
  return clean(altFrom(fileName), { prepend, append });
};
