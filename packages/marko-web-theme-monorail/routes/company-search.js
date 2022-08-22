const loader = require('@parameter1/base-cms-marko-web-search/loaders/search');
const jsonErrorHandler = require('@parameter1/base-cms-marko-web/express/json-error-handler');
const { asyncRoute } = require('@parameter1/base-cms-utils');

const queryFragment = require('../graphql/fragments/company-search');

module.exports = (app) => {
  app.get('/__company-search', asyncRoute(async (req, res) => {
    const { searchQuery } = req.query;
    const { apollo, $baseBrowse } = res.locals;

    const response = await loader(
      {
        apolloBaseCMS: apollo,
        apolloBaseBrowse: $baseBrowse,
      },
      {
        status: 1,
        contentTypes: ['COMPANY'],
        assignedToWebsiteSiteIds: [req.app.locals.config.websiteContext.id],
        searchQuery,
        queryFragment,
      },
    );
    res.json(response);
  }), jsonErrorHandler());
};
