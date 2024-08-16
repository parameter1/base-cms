const adPreview = require('../templates/ad-preview');

module.exports = (app, namespace) => {
  if (namespace) {
    app.get('/ad-preview/:creativeId([a-z0-9-/_]+)', (req, res) => {
      const { creativeId } = req.params;
      // @todo: Look into API to get title & description to send to template as well
      return res.marko(adPreview, { creativeId, namespace });
    });
  }
};
