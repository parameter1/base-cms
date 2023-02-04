const { getAsArray } = require('@parameter1/base-cms-object-path');

module.exports = ({ nodes, label, sectionName }) => nodes.map((node) => {
  const { primarySection, ...rest } = node;
  const generatedPrimarySection = getAsArray(node, 'labels').includes(label) ? {
    ...primarySection, name: sectionName,
  } : primarySection;
  const parsedNode = generatedPrimarySection.name === sectionName ? {
    ...rest,
    primarySection: generatedPrimarySection,
    withSection: true,
  } : node;
  return parsedNode;
});
