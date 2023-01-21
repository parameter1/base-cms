const { withMagazineIssue, withMagazinePublication } = require('@parameter1/base-cms-marko-web/middleware');
const index = require('../templates/index');
const publication = require('../templates/publication');
const publicationFragment = require('../graphql/fragments/magazine-publication-page');
const issue = require('../templates/issue');
const issueFragment = require('../graphql/fragments/magazine-issue-page');

module.exports = (app, templates = {}, fragments = {}) => {
  app.get('/magazine', (req, res) => {
    res.marko(templates.index || index);
  });

  app.get('/magazine/:id([a-fA-F0-9]{24})', withMagazinePublication({
    template: templates.publication || publication,
    queryFragment: fragments.publicationFragment || publicationFragment,
  }));

  app.get('/magazine/:id(\\d+)', withMagazineIssue({
    template: templates.issue || issue,
    queryFragment: fragments.issueFragment || issueFragment,
  }));
};
