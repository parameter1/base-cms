const imageHeight = require('./image-height');

module.exports = ({
  fluid,
  ar,
  width = 320,
  delimiter = ':',
}) => {
  if (fluid === true) {
    if (ar) return { modifier: `fluid-${ar.replace(delimiter, 'by')}` };
    return { modifier: 'fluid' };
  }
  if (ar) {
    return { width, height: imageHeight(width, ar, delimiter) };
  }
  return { width };
};
