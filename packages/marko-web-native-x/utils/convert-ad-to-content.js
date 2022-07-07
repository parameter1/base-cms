const { get } = require('@parameter1/base-cms-object-path');

module.exports = (ad = {}, { sectionName = 'Sponsored' } = {}) => {
  const { campaign, creative, image } = ad;
  const startDate = get(campaign, 'criteria.start');
  const { updatedAt } = campaign;
  return {
    id: campaign.id,
    name: creative.title,
    shortName: creative.title,
    typeTitled: 'Text Ad',
    type: 'text-ad',
    teaser: creative.teaser,
    linkText: creative.linkText,
    published: updatedAt > startDate ? updatedAt : startDate,
    canonicalPath: ad.href, // @deprecated. Use siteContext.path instead
    siteContext: {
      path: ad.href,
      canonicalUrl: ad.href,
      __typename: 'ContentSiteContext',
    },
    primaryImage: {
      id: image.id,
      alt: creative.title,
      src: image.src,
      __typename: 'AssetImage',
    },
    primarySection: {
      name: sectionName,
      fullName: sectionName,
      __typename: 'WebsiteSection',
    },
    company: {
      name: campaign.advertiserName,
      __typename: 'ContentCompany',
    },
    __typename: 'ContentTextAd',
  };
};
