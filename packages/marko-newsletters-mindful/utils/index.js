const fetchNativeEmailAd = require('./fetch-native-email-ad');
const logger = require('./logger');

module.exports = {
  dateToTimestamp(date) {
    const dateInUTC = new Date(Date.UTC(
      date.toDate().getFullYear(),
      date.toDate().getMonth(),
      date.toDate().getDate(),
    ));
    return dateInUTC.valueOf();
  },
  fetchNativeEmailAd,
  logger,
};
