const { asyncRoute } = require('@parameter1/base-cms-utils');
const { getAsObject } = require('@parameter1/base-cms-object-path');
const defaultFragment = require('../apollo/graphql/fragments/story');
const buildQuery = require('../apollo/graphql/queries/story');
const applyQueryParams = require('../utils/apply-query-params');

/**
 * @param NativeXConfiguration The NativeX config
 * @param object The Marko template to render
 * @param Document A query fragment to be used with the story query
 */
module.exports = ({
  config,
  template,
  queryFragment = defaultFragment,
} = {}) => asyncRoute(async (req, res) => {
  const { query } = req;
  if (req.path.substr(-1) === '/' && req.path.length > 1) {
    return res.redirect(301, applyQueryParams({ path: req.path.slice(0, -1), query }));
  }

  const { id } = req.params;
  const preview = Boolean(req.query.preview);
  const result = await config.client.query({
    query: buildQuery(queryFragment),
    variables: { input: { id, preview } },
  });
  const story = getAsObject(result, 'data.publishedStory');
  return res.marko(template, { story });
});
