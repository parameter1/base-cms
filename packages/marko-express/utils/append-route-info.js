/**
 * @typedef RouteInfoPair
 * @prop {string} key The key to set to `res.locals.route`
 * @prop {*} value The value to set
 *
 * @param {import("express").Response} res The Express response object.
 * @param {RouteInfoPair[]} pairs The key/value pairs to set.
 */
module.exports = (res, pairs) => {
  const { route } = res.locals || {};
  res.locals = {
    ...res.locals,
    route: {
      ...route,
      ...pairs.reduce((o, { key, value }) => ({ ...o, [key]: value }), {}),
    },
  };
};
