const { getAsArray } = require('@parameter1/base-cms-object-path');

module.exports = ({ nodes, labelToSearchFor, sectionNameToSet }) => nodes.map((node) => {
  const { primarySection, ...rest } = node;
  const generatedPrimarySection = getAsArray(node, 'labels').includes(labelToSearchFor) ? {
    ...primarySection, name: sectionNameToSet,
  } : primarySection;
  const parsedNode = generatedPrimarySection.name === sectionNameToSet ? {
    ...rest,
    primarySection: generatedPrimarySection,
    withSection: true,
  } : node;
  return parsedNode;
});
