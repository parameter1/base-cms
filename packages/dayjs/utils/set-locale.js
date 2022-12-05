const dayjs = require('../index');

module.exports = ({ locale }) => {
  switch (locale) {
    case 'es':
      // eslint-disable-next-line global-require
      require('dayjs/locale/es');
      dayjs.locale(locale);
      break;
    default:
      // Defaults to 'en' (English) out of the box
      break;
  }
};
