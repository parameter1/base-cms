const gql = require('graphql-tag');
const { websiteSections } = require('@parameter1/base-cms-web-common/block-loaders');

const selectedQueryFragment = gql`
  fragment MarkoWebSearchSeletedWebsiteSectionFragment on WebsiteSection {
    id
    name
    alias
    isRoot
    hierarchy {
      id
      name
      alias
    }
    children(input: { pagination: { limit: 100 }, sort: { field: name, order: asc } }) {
      edges {
        node {
          id
          name
          alias
        }
      }
    }
  }
`;

const queryFragment = gql`
  fragment MarkoWebSearchWebsiteSectionFragment on WebsiteSection {
    id
    name
    alias
  }
`;

module.exports = async ({ $markoWebSearch: search, apolloBaseCMS } = {}) => {
  const { assignedToWebsiteSectionIds: selectedIds } = search.input;
  const { assignedToWebsiteSectionIds: configuredIds } = search.config;

  // for now, only handle one selected section.
  const selectedId = selectedIds && selectedIds.length ? selectedIds[0] : null;

  const [selectedSection, configuredSections] = await Promise.all([
    (async () => {
      if (!selectedIds || !selectedIds.length) return null;
      const { nodes } = await websiteSections(apolloBaseCMS, {
        includeIds: [selectedId],
        limit: 1,
        queryFragment: selectedQueryFragment,
      });
      const [node] = nodes;
      node.hierarchyMap = node.hierarchy.reduce((map, section) => {
        map.set(section.id, true);
        return map;
      }, new Map());
      return node;
    })(),

    (async () => {
      if (!configuredIds || !configuredIds.length) return [];
      const { nodes } = await websiteSections(apolloBaseCMS, {
        includeIds: configuredIds,
        limit: configuredIds.length,
        sort: { field: 'name', order: 'asc' },
        queryFragment,
      });
      return nodes;
    })(),
  ]);
  return { selectedSection, configuredSections };
};
