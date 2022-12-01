const dayjs = require('dayjs');
const advancedFormat = require('dayjs/plugin/advancedFormat');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

module.exports = dayjs.extend(advancedFormat).extend(utc).extend(timezone);
