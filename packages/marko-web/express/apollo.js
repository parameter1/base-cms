const { apolloClient } = require('@parameter1/base-cms-express-apollo');

module.exports = (app, uri, config = {}) => {
  app.use(apolloClient(uri, config, config.link));
};
