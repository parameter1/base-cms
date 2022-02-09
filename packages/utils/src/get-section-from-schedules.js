module.exports = async ({ content, siteId, load }) => {
  const { sectionQuery } = content;
  const query = {
    status: 1,
    'site.$id': siteId,
  };
  if (sectionQuery.length) {
    const sectionsFromScheds = sectionQuery.filter(schedule => schedule.siteId === siteId);
    const foundSections = await Promise.all(sectionsFromScheds.map(section => load('websiteSection', section.sectionId, {}, query)));
    const currentSiteSection = foundSections.find(({ alias }) => alias !== 'home');
    if (currentSiteSection) return currentSiteSection;
    return null;
  }
  return null;
};
