const { getAsObject } = require('@parameter1/base-cms-object-path');

module.exports = ({ advertiser, campaign, creative }, { sectionName = 'Sponsored' } = {}) => {
  const { updatedAt } = campaign.lineItem;
  const creativeHref = creative.href.includes('?') ? `${creative.href}@{webtrack}@` : `${creative.href}?@{webtrack}@`;
  return {
    id: campaign.id,
    name: creative.title,
    linkText: creative.linkText,
    shortName: creative.title,
    typeTitled: 'Promotion',
    type: 'promotion',
    teaser: creative.teaser,
    published: updatedAt,
    siteContext: {
      path: creativeHref,
      canonicalUrl: creativeHref,
      url: creativeHref,
    },
    primaryImage: getAsObject(creative, 'image'),
    primarySection: {
      name: sectionName,
      fullName: sectionName,
    },
    company: {
      id: advertiser.id,
      name: advertiser.name,
      website: advertiser.website,
      primaryImage: getAsObject(advertiser, 'image'),
    },
  };
};
