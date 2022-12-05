const loadWebsite = require('@parameter1/base-cms-web-common/website-context');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const dayjs = require('@parameter1/base-cms-dayjs');

module.exports = coreConfig => asyncRoute(async (req, res, next) => {
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
  switch (locale) {
    case 'es':
      dayjs.locale(locale);
      break;
    default:
      // Defaults to 'en' (English) our of the box
      break;
  }
  next();
});
