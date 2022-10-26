const routes = require('./routes');
const middleware = require('./middleware');

/**
 *
 * @param {object} app The express app instance
 * @param {IdentityXConfiguration} config The IdentityX config
 */
module.exports = (app, config, {
  templates = {},
} = {}) => {
  app.use(middleware(config));
  app.use('/__idx', routes);

  config.endpointTypes.forEach((type) => {
    const endpoint = config.getEndpointFor(type);
    const template = templates[type];
    if (!template) return;

    app.get(endpoint, (req, res) => {
      const { token } = req.identityX;
      // Redirect to profile if a user token is already present (refresh after link click)
      if (type === 'authenticate' && token) res.redirect(302, config.getEndpointFor('profile'));
      res.marko(template);
    });
  });
};
