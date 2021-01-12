const { asyncRoute } = require('@parameter1/base-cms-utils');
const { magazineIssue: loader } = require('@parameter1/base-cms-web-common/page-loaders');
const { blockMagazineIssue: queryFactory } = require('@parameter1/base-cms-web-common/query-factories');
const PageNode = require('./page-node');

module.exports = ({
  template,
  queryFragment,
} = {}) => asyncRoute(async (req, res) => {
  const { apollo } = req;
  const id = Number(req.params.id);
  const issue = await loader(apollo, { id });
  const pageNode = new PageNode(apollo, {
    queryFactory,
    queryFragment,
    variables: { input: { id } },
    resultField: 'magazineIssue',
  });
  return res.marko(template, { ...issue, pageNode });
});
