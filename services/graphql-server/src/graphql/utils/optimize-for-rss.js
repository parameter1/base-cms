const preloadRelMany = require('./preload-rel-many');

module.exports = async (paginated, { basedb, info }) => {
  const edges = paginated.edges();

  const preloaded = await preloadRelMany({
    basedb,
    owningEdges: edges,
    info,
    targets: [
      {
        dbPath: 'images',
        selectionPath: 'edges.node.images.edges.node',
        modelName: 'platform.Asset',
        criteria: { type: 'Image' },
      },
      {
        dbPath: 'authors',
        selectionPath: 'edges.node.authors.edges.node',
        modelName: 'platform.Content',
        criteria: { type: 'Contact', status: 1 },
      },
    ],
  });
  return {
    ...paginated,
    edges: preloaded,
  };
};
