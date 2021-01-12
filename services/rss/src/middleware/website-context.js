const loadWebsite = require('@parameter1/base-cms-web-common/website-context');
const { asyncRoute } = require('@parameter1/base-cms-utils');

module.exports = () => asyncRoute(async (req, res, next) => {
  const { apollo } = res.locals;
  res.locals.websiteContext = await loadWebsite(apollo);
  next();
});
