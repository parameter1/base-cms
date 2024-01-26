const gql = require('graphql-tag');
const contentAccessSubmission = require('./content-access-submission');
const contentDownloadSubmission = require('./content-download-submission');
const inquirySubmission = require('./inquiry-submission');
const option = require('./option');
const redirect = require('./redirect');
const schedule = require('./schedule');
const section = require('./section');
const site = require('./site');

module.exports = gql`

${contentAccessSubmission}
${contentDownloadSubmission}
${inquirySubmission}
${option}
${redirect}
${schedule}
${section}
${site}

`;
