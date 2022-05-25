const { withContent } = require('@parameter1/base-cms-marko-web/middleware');

const content = require('../templates/content');
const queryFragment = require('../../graphql/fragments/content-page');
const index = require('../templates/index');

module.exports = (app) => {
  app.get('/', (_, res) => {
    res.marko(index);
  });
  app.get('/*?:id(\\d{8})*', withContent({
    template: content,
    queryFragment,
  }));
};
