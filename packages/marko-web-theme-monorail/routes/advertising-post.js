const { asyncRoute } = require('@parameter1/base-cms-utils');
const { get } = require('@parameter1/base-cms-object-path');
const advertisingPostById = require('../graphql/fragments/mindful-advertising-post-by-id');
// const template = require('../templates/content/advertising-post');

module.exports = (app, { path = 'sponsored', template }) => {
  app.get(`/${path}/:section/:slug/:id`, asyncRoute(async (req, res) => {
    const { service } = req.mindful;
    const { path: p, url } = req;
    if (p.substr(-1) === '/' && p.length > 1) {
      const queryParams = url.slice(p.length);
      const safe = p.slice(0, -1).replace(/\/+/g, '/');
      res.redirect(301, `${safe}${queryParams}`);
      return;
    }

    const { id: _id } = req.params;
    const result = await service.getAdvertisingPostById({ _id }, advertisingPostById);
    const story = service.convertAdvertisingPostToNativeStory({
      advertisingPost: get(result, 'data.advertisingPostById'),
      preview: Boolean(req.query.preview),
    });
    res.marko(template, { story });
  }));
};
