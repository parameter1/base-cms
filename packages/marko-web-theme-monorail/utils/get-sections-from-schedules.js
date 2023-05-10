module.exports = (schedules = [], rootAlias = 'directory') => {
  const sections = schedules
    .filter((schedule) => {
      const { alias } = schedule.section;
      return alias.startsWith(rootAlias) && alias !== rootAlias;
    })
    .map((schedule) => schedule.section)
    .sort((a, b) => a.name.localeCompare(b.name));
  return sections;
};
