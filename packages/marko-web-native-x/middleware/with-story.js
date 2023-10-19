const { asyncRoute } = require('@parameter1/base-cms-utils');
const { getAsObject } = require('@parameter1/base-cms-object-path');
const defaultFragment = require('../apollo/graphql/fragments/story');
const buildQuery = require('../apollo/graphql/queries/story');

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
  const { path, url } = req;
  if (path.substr(-1) === '/' && path.length > 1) {
    const query = url.slice(path.length);
    const safe = path.slice(0, -1).replace(/\/+/g, '/');
    res.redirect(301, `${safe}${query}`);
    return;
  }

  const { id } = req.params;
  const preview = Boolean(req.query.preview);
  const result = await config.client.query({
    query: buildQuery(queryFragment),
    variables: { input: { id, preview } },
  });
  const story = getAsObject(result, 'data.publishedStory');
  res.marko(template, { story });
});
