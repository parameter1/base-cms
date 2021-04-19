const { getAsArray } = require('@parameter1/base-cms-object-path');


const getChildSectionIds = (section, ids) => {
  const children = getAsArray(section, 'children.edges').map(({ node }) => node);

  children.forEach((child) => {
    ids.push(child.id);
    getChildSectionIds(child, ids);
  });
  return ids;
};

module.exports = { getChildSectionIds };
