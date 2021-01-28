const createClient = require('./create-client');

module.exports = (uri, config, linkConfig, contextFn) => (req, res, next) => {
  const apollo = createClient(uri, config, linkConfig, (ctx) => {
    if (typeof contextFn === 'function') return contextFn({ req, res, ctx });
    return undefined;
  });
  req.apollo = apollo;
  res.locals.apollo = apollo;
  next();
};
