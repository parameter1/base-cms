const { get, getAsObject } = require('@parameter1/base-cms-object-path');

module.exports = (story = {}, { sectionName = 'Sponsored' } = {}) => {
  const advertiser = getAsObject(story, 'advertiser');
  const contentImage = getAsObject(story, 'primaryImage');
  const advertiserImage = getAsObject(story, 'advertiser.logo');
  return {
    id: story.id,
    name: story.title,
    shortName: story.title,
    body: story.body,
    typeTitled: 'Article',
    type: 'article',
    teaser: story.teaser,
    published: get(story, 'publishedAt'),
    siteContext: {
      path: story.url,
      canonicalUrl: story.url,
      __typename: 'ContentSiteContext',
    },
    primaryImage: {
      id: contentImage.id,
      alt: story.title,
      src: contentImage.src,
      __typename: 'AssetImage',
    },
    primarySection: {
      name: sectionName,
      fullName: sectionName,
      __typename: 'WebsiteSection',
    },
    company: {
      name: advertiser.name,
      primaryImage: {
        id: advertiserImage.id,
        alt: advertiser.name,
        src: advertiserImage.src,
        __typename: 'AssetImage',
      },
      __typename: 'ContentCompany',
    },
    __typename: 'ContentArticle',
  };
};
