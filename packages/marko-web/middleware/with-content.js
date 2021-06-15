const { get } = require('@parameter1/base-cms-object-path');
const { asyncRoute, isFunction: isFn } = require('@parameter1/base-cms-utils');
const { content: loader } = require('@parameter1/base-cms-web-common/page-loaders');
const { blockContent: queryFactory } = require('@parameter1/base-cms-web-common/query-factories');
const PageNode = require('./page-node');
const buildContentInput = require('../utils/build-content-input');
const applyQueryParams = require('../utils/apply-query-params');

module.exports = ({
  template,
  queryFragment,
  idResolver,
  redirectOnPathMismatch = true,
  loaderQueryFragment,
  redirectToFn,
  pathFn,
  formatResponse,
} = {}) => asyncRoute(async (req, res) => {
  const id = isFn(idResolver) ? await idResolver(req, res) : req.params.id;
  const { apollo, query } = req;

  const additionalInput = buildContentInput({ req });
  const content = await loader(apollo, { id, additionalInput, queryFragment: loaderQueryFragment });
  const redirectTo = isFn(redirectToFn) ? redirectToFn({ content }) : content.redirectTo;
  const path = isFn(pathFn) ? pathFn({ content }) : get(content, 'siteContext.path');

  if (redirectTo) {
    return res.redirect(301, applyQueryParams({ path: redirectTo, query }));
  }
  if (redirectOnPathMismatch && path !== req.path) {
    const pathTo = req.query['preview-mode'] ? `${path}?preview-mode=true` : path;
    return res.redirect(301, applyQueryParams({ path: pathTo, query }));
  }
  const pageNode = new PageNode(apollo, {
    queryFactory,
    queryFragment,
    variables: { input: { id: Number(id), ...additionalInput } },
    resultField: 'content',
  });
  if (isFn(formatResponse)) await formatResponse({ res, content, pageNode });
  return res.marko(template, { ...content, pageNode });
});
