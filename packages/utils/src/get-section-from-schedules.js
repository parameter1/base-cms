module.exports = async ({
  content,
  siteId,
  projection,
  load,
}) => {
  const { sectionQuery } = content;
  if (!sectionQuery.length) return null;
  const query = {
    status: 1,
    'site.$id': siteId,
    alias: { $ne: 'home' },
  };
  const sectionsFromScheds = sectionQuery.filter(schedule => `${schedule.siteId}` === `${siteId}`);
  const foundSections = await load('websiteSection', sectionsFromScheds.map(schedule => schedule.sectionId), projection, query);
  if (foundSections.length) return foundSections.filter(v => v._id)[0];
  return null;
};
