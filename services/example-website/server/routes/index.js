const { withContent } = require('@parameter1/base-cms-marko-web/middleware');
const loadInquiry = require('@parameter1/base-cms-marko-web-inquiry');
const omedaNewsletters = require('@parameter1/base-cms-marko-web-omeda/routes/omeda-newsletters');

const content = require('../templates/content');
const queryFragment = require('../../graphql/fragments/content-page');
const index = require('../templates/index');

module.exports = (app) => {
  loadInquiry(app);
  omedaNewsletters(app);
  app.get('/', (_, res) => {
    res.marko(index);
  });
  app.get('/*?:id(\\d{8})*', withContent({
    template: content,
    queryFragment,
  }));
};
