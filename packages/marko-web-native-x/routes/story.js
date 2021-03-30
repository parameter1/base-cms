const { asyncRoute } = require('@parameter1/base-cms-utils');
const { getAsObject } = require('@parameter1/base-cms-object-path');
const defaultTemplate = require('../templates/story');
const createClient = require('../apollo/create-client');
const defaultFragment = require('../apollo/graphql/fragments/story');
const buildQuery = require('../apollo/graphql/queries/story');

/**
 * @param NativeXConfiguration The NativeX config
 * @param object The Marko template to render
 * @param Document A query fragment to be used with the story query
 */
module.exports = ({
  config,
  template = defaultTemplate,
  queryFragment = defaultFragment,
} = {}) => asyncRoute(async (req, res, next) => {
  if (config.isEnabled()) {
    const client = createClient(config.getGraphQLUri());
    const { id } = req.params;
    const result = await client.query({
      query: buildQuery(queryFragment),
      variables: { input: { id } },
    });
    const story = getAsObject(result, 'data.publishedStory');
    res.marko(template, { story });
  } else {
    next();
  }
});
