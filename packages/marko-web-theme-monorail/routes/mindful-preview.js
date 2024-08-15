const mindfulPreview = require('../templates/mindful-preview');

module.exports = (app, namespace) => {
  if (namespace) {
    app.get('/mindful-preview/:creativeId([a-z0-9-/_]+)', (req, res) => {
      const { creativeId } = req.params;
      // @todo: Look into API to get title & description to send to template as well
      return res.marko(mindfulPreview, { creativeId, namespace });
    });
  }
};
