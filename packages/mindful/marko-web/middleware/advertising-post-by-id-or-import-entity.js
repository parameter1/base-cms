const { asyncRoute } = require('@parameter1/base-cms-utils');
const { getAsObject } = require('@parameter1/base-cms-object-path');
const advertisingPostById = require('../../graphql/fragments/advertising-post-by-id');

module.exports = (app, {
  route,
  template,
  tenant,
  provider,
  fragment = advertisingPostById,
}) => {
  app.get(route, asyncRoute(async (req, res) => {
    const { service } = req.mindful;
    const { id: _id } = req.params;
    const { namespace } = tenant;
    const result = await service.getAdvertisingPostByIdOrImportEntity({
      _id,
      provider,
      tenant: namespace,
    }, fragment);
    const story = service.convertAdvertisingPostToNativeStory({
      advertisingPost: getAsObject(result, 'data.advertisingPostByIdOrImportEntity'),
      preview: Boolean(req.query.preview),
    });
    res.marko(template, { story });
}))};
