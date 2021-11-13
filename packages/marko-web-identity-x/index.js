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
    if (template) app.get(endpoint, (_, res) => res.marko(template));
  });
};
