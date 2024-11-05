const createError = require('http-errors');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const defaultFragment = require('../../graphql/fragments/advertising-post-by-id');

module.exports = (app, {
  route,
  template,
  tenant,
  provider,
  fragment = defaultFragment,
}) => {
  app.get(route, asyncRoute(async (req, res) => {
    // redirect to remove trailing / for analytic puposes(pageviews)
    const { path, url } = req;
    if (path.substr(-1) === '/' && path.length > 1) {
      const queryParams = url.slice(path.length);
      const safe = path.slice(0, -1).replace(/\/+/g, '/');
      res.redirect(301, `${safe}${queryParams}`);
      return;
    }

    const { service } = req.mindful;
    const { id: _id } = req.params;
    const story = await service.getAdvertisingPostAsNativeStory({
      _id,
      preview: Boolean(req.query.preview),
      tenant,
      provider,
    }, fragment);
    if (!story) throw createError(404, `No advertising post was found for id '${_id}'`);

    // redirect path to story url if url does not match.
    const storyURL = new URL(story.url);
    if (storyURL.pathname !== path) {
      // @todo determin if this should be story.url vs storyURL.pathname... fullURL vs /path
      res.redirect(301, storyURL.pathname);
      return;
    }

    res.marko(template, { story });
  }));
};
