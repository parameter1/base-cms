const deepAssign = require('deep-assign');

const contentAccessSubmission = require('./content-access-submission');
const contentDownloadSubmission = require('./content-download-submission');
const inquirySubmission = require('./inquiry-submission');
const redirect = require('./redirect');
const schedule = require('./schedule');
const section = require('./section');
const site = require('./site');

module.exports = deepAssign(
  contentAccessSubmission,
  contentDownloadSubmission,
  inquirySubmission,
  redirect,
  schedule,
  section,
  site,
);
