const olyticsCookie = require('@parameter1/base-cms-marko-web-omeda/olytics/customer-cookie');

module.exports = ({ res }) => {
  olyticsCookie.clearFrom(res);
};
