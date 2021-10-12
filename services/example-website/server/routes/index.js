const index = require('../templates/index');

module.exports = (app) => {
  app.get('/', (_, res) => {
    res.marko(index);
  });
};
