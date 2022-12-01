const dayjs = require('../dayjs');

module.exports = () => (req, _, next) => {
  // NOTE: This middleware must be placed following a middleware that sets this objects values
  const dateObj = req.app.locals.markoCoreDate;
  if (dateObj && dateObj.locale) {
    const { locale } = dateObj;
    switch (locale) {
      case 'es':
        // eslint-disable-next-line global-require
        require('dayjs/locale/es');
        dayjs.locale(locale);
        break;
      default:
        // Defaults to 'en' (English) our of the box
        break;
    }
  }

  next();
};
