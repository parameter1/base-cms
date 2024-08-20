const { get } = require('@parameter1/base-cms-object-path');

const now = new Date();

module.exports = (creative) => {
  const { _id, url } = creative;
  return {
    id: _id,
    name: get(creative, 'name.default'),
    // linkText: creative.linkText,
    shortName: get(creative, 'name.default'),
    typeTitled: 'Mindful',
    type: 'mindful',
    teaser: get(creative, 'teaser'),
    published: now,
    siteContext: {
      path: url,
      canonicalUrl: url,
      url,
    },
    primaryImage: {
      id: get(creative, 'imageEdge.node.id'),
      src: get(creative, 'imageEdge.node.src.url'),
    },
    primarySection: {
      name: 'Sponsored',
      fullName: 'Sponsored',
    },
    company: {
      id: get(creative, 'companyEdge.node.id'),
      name: get(creative, 'companyEdge.node.name.default'),
    },
  };
};
