const { getAsArray } = require('@parameter1/base-cms-object-path');

const getChildSectionsById = (section, childSections = {}, includeSelf = true) => {
  const { id } = section;
  const children = getAsArray(section, 'children.edges').map(({ node }) => node);
  return {
    ...children.reduce((obj, child) => getChildSectionsById(child, obj), childSections),
    ...(includeSelf && !section[id] && { [id]: section }),
  };
};
module.exports = { getChildSectionsById };
