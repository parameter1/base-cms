const routes = require('./routes');
const middleware = require('./middleware');

/**
 *
 * @param {object} app The express app instance
 * @param {IdentityXConfiguration} config The IdentityX config
 */
module.exports = (app, config) => {
  app.use(middleware(config));
  app.use('/__idx', routes);
};
