module.exports = async ({
  content,
  siteId,
  projection,
  load,
}) => {
  const { sectionQuery } = content;
  if (!sectionQuery || !sectionQuery.length) return null;
  const query = {
    status: 1,
    'site.$id': siteId,
    alias: { $ne: 'home' },
  };
  const sectionsFromScheds = sectionQuery.filter((schedule) => `${schedule.siteId}` === `${siteId}`);
  const foundSections = await Promise.all(sectionsFromScheds.map((section) => load('websiteSection', section.sectionId, projection, query)));
  return foundSections.filter((v) => v)[0] || null;
};
