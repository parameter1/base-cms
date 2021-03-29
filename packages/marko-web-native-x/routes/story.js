const { asyncRoute } = require('@parameter1/base-cms-utils');
const { getAsObject } = require('@parameter1/base-cms-object-path');
const createClient = require('../utils/create-client');
const defaultTemplate = require('../templates/story');
const query = require('../graphql/queries/story');

module.exports = ({
  config,
  template = defaultTemplate,
} = {}) => asyncRoute(async (req, res, next) => {
  if (config.isEnabled()) {
    const client = createClient(config.getGraphQLUri());
    const { id } = req.params;
    const result = await client.query({ query, variables: { input: { id } } });
    const story = getAsObject(result, 'data.publishedStory');
    res.marko(template, { story });
  } else {
    next();
  }
});
