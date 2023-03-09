const appendRouteInfo = require('./append-route-info');

/**
 *
 * @param {import("express").Response} res The Express response object.
 *
 * @param {object} params
 * @param {string} params.kind The route kind.
 * @param {string} params.type The route kind sub-type.
 */
module.exports = (res, { kind, type }) => {
  appendRouteInfo(res, [
    { key: 'kind', value: kind },
    { key: 'type', value: `${type}` },
  ]);
};
