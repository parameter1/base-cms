module.exports = async ({ content, siteId, load }) => {
  const { sectionQuery } = content;
  const query = {
    status: 1,
    'site.$id': siteId,
    alias: { $ne: 'home' },
  };
  if (sectionQuery.length) {
    const sectionsFromScheds = sectionQuery.filter(schedule => schedule.siteId === siteId);
    const foundSections = await Promise.all(sectionsFromScheds.map(section => load('websiteSection', section.sectionId, {}, query)));
    if (foundSections.length) return foundSections.filter(v => v._id)[0];
    return null;
  }
  return null;
};
