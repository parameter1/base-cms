const { asyncRoute } = require('@parameter1/base-cms-utils');
const { get } = require('@parameter1/base-cms-object-path');
const defaultFragment = require('../../graphql/fragments/advertising-post-by-id');

module.exports = (app, {
  route,
  template,
  fragment = defaultFragment,
}) => {
  app.get(route, asyncRoute(async (req, res) => {
    const { service } = req.mindful;
    const { id: _id } = req.params;
    const result = await service.getAdvertisingPostById({ _id }, fragment);
    const story = service.convertAdvertisingPostToNativeStory({
      advertisingPost: get(result, 'data.advertisingPostById'),
      preview: Boolean(req.query.preview),
    });
    res.marko(template, { story });
  }));
};
