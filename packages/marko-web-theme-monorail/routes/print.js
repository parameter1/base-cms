const { withContent } = require('@parameter1/base-cms-marko-web/middleware');
const template = require('../templates/content/print');

module.exports = (app, queryFragment) => {
  if (!queryFragment) throw new Error('Missing queryFragment for the print content route!');
  app.get('/print/content/:id(\\d{8})', withContent({
    template,
    queryFragment,
    redirectOnPathMismatch: false,
  }));
};
