/**
 * Generates the marko `$global` template property.
 *
 * @param {object} res The Express response object.
 */
module.exports = (res, data) => {
  const { req, app } = res;
  const $global = {
    app,
    req,
    res,
    ...app.locals,
    ...res.locals,
  };
  return { ...$global, ...(data && data.$global) };
};
