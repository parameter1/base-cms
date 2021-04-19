
const { getAsArray } = require('@parameter1/base-cms-object-path');

const build = (facets, total = [], entries) => {
  facets.forEach((facet) => {
    const { id, name } = facet;
    const children = getAsArray(facet, 'children.edges').map(({ node }) => node);
    const current = entries ? [{ id, name }, ...entries] : [{ id, name }];
    total.push(current);
    if (Array.isArray(children) && children.length) build(children, total, current);
  });
  return total;
};

module.exports = (facets, activeId) => {
  const map = new Map();
  const flat = build(facets);
  flat.forEach((row) => {
    const primary = row.shift();
    const parentIds = row.map(r => r.id);
    map.set(`${primary.id}`, { ...primary, parentIds, activeIds: [primary.id, ...parentIds] });
  });
  const active = map.get(`${activeId}`);
  if (active) return active;
  return { parentIds: [], activeIds: [] };
};
