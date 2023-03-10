const { asyncRoute } = require('@parameter1/base-cms-utils');
const { magazinePublication: loader } = require('@parameter1/base-cms-web-common/page-loaders');
const { blockMagazinePublication: queryFactory } = require('@parameter1/base-cms-web-common/query-factories');
const setRouteKind = require('@parameter1/base-cms-marko-express/utils/set-route-kind');
const PageNode = require('./page-node');

module.exports = ({
  template,
  queryFragment,
} = {}) => asyncRoute(async (req, res) => {
  const { apollo } = req;
  const { id } = req.params;
  const publication = await loader(apollo, { id });

  // set the route kind
  setRouteKind(res, { kind: 'magazine-publication', type: '' });
  const pageNode = new PageNode(apollo, {
    queryFactory,
    queryFragment,
    variables: { input: { id } },
    resultField: 'magazinePublication',
  });
  return res.marko(template, { ...publication, pageNode });
});
