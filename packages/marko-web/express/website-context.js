const loadWebsite = require('@parameter1/base-cms-web-common/website-context');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const { setDayjsLocale } = require('@parameter1/base-cms-dayjs/utils');

module.exports = (coreConfig) => asyncRoute(async (req, res, next) => {
  const { apollo } = res.locals;
  const websiteContext = await loadWebsite(apollo);
  coreConfig.setWebsiteContext(websiteContext);

  const locale = coreConfig.website('date.locale');
  // Set marko core date config.
  req.app.locals.markoCoreDate = {
    timezone: coreConfig.website('date.timezone'),
    locale,
    format: coreConfig.website('date.format'),
  };
  setDayjsLocale({ locale });
  next();
});
