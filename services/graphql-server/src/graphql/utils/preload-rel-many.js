const { BaseDB } = require('@parameter1/base-cms-db');
const { getAsArray, set } = require('@parameter1/base-cms-object-path');
const { introspectFromInfo, getReturnType } = require('../instropection');
const getProjection = require('./get-projection');

/**
 * @typedef PaginatedEdge
 * @prop {object} node
 * @prop {Function} cursor
 *
 * @typedef PreloadRelManyTarget
 * @prop {string} dbPath
 * @prop {string} selectionPath
 * @prop {string} modelName
 * @prop {object} [criteria]
 *
 * @param {object} params
 * @param {BaseDB} params.basedb
 * @param {PaginatedEdge[]} params.owningEdges
 * @param {import("graphql").GraphQLResolveInfo} params.info
 * @param {PreloadRelManyTarget[]} params.targets
 */
module.exports = async ({
  basedb,
  owningEdges,
  info,
  targets,
}) => {
  const introspected = introspectFromInfo(info);

  const maps = await Promise.all(targets.map(async ({
    dbPath,
    selectionPath,
    modelName,
    criteria,
  }) => {
    const { selections = [], field } = introspected.get(selectionPath) || {};
    if (!selections.length) return new Map(); // nothing selected for this field.

    // extract the mongodb projection
    const projection = getProjection(
      info.schema,
      getReturnType(field.type),
      { selections },
      info.fragments,
    );

    // extract the referenced/related IDs.
    const ids = owningEdges.reduce((arr, { node }) => {
      arr.push(...BaseDB.extractRefIds(getAsArray(node, dbPath)));
      return arr;
    }, []);

    // load all related models using the projection based on the selection set.
    const docs = ids.length
      ? await basedb.find(modelName, { _id: { $in: ids }, ...criteria }, { projection })
      : [];

    // map related models by ID.
    return {
      dbPath,
      mapped: docs.reduce((map, doc) => {
        map.set(`${doc._id}`, doc);
        return map;
      }, new Map()),
    };
  }));

  return owningEdges.map((edge) => {
    const node = { ...edge.node };
    maps.forEach(({ dbPath, mapped }) => {
      set(node, dbPath, BaseDB.extractRefIds(getAsArray(node, dbPath)).map((id) => {
        const doc = mapped.get(`${id}`);
        return doc;
      }).filter((doc) => doc));
    });
    return { ...edge, node };
  });
};
