const defaultBuilder = require('./default');
const contentBuilder = require('./content');
const websiteSectionBuilder = require('./website-section');
const dynamicPageBuilder = require('./dynamic-page');
const magazineIssueBuilder = require('./magazine-issue');
const magazinePublicationBuilder = require('./magazine-publication');
const nativeXStoryBuilder = require('./native-x-story');

module.exports = {
  defaultBuilder,
  contentBuilder,
  websiteSectionBuilder,
  dynamicPageBuilder,
  magazineIssueBuilder,
  magazinePublicationBuilder,
  nativeXStoryBuilder,
};
