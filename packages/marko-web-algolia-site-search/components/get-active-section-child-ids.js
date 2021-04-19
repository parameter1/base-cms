const { getAsArray } = require('@parameter1/base-cms-object-path');
const { getChildSectionIds } = require('./get-child-section-ids');


const getActiveSectionChildIds = (sections, activeId, ids = []) => {
  if (!activeId) return [];
  sections.forEach((section) => {
    const children = getAsArray(section, 'children.edges').map(({ node }) => node);
    const childSectionIds = getChildSectionIds(section, []);
    if (section.id === parseFloat(activeId)) {
      ids.concat(childSectionIds);
    }
    if (childSectionIds.includes(parseFloat(activeId))) {
      getActiveSectionChildIds(children, activeId, ids);
    }
  });
  return ids;
};

module.exports = { getActiveSectionChildIds };
