module.exports = async ({ content, siteId, load }) => {
  const { sectionQuery } = content;
  const query = {
    status: 1,
    'site.$id': siteId,
  };
  if (sectionQuery.length) {
    const sectionFromSched = sectionQuery.find(({ siteId: schedSiteId }) => siteId === schedSiteId);
    if (sectionFromSched) {
      const currentSiteSection = await load('websiteSection', sectionFromSched.sectionId, {}, query);
      if (currentSiteSection) return currentSiteSection;
    }
    return null;
  }
  return null;
};
