const createError = require('http-errors');

const load = (id) => {
  try {
    return require(id); // eslint-disable-line
  } catch (e) {
    throw createError(404, e.message.split('\n').shift());
  }
};

const parseJSON = (value) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return {};
  }
};

module.exports = (app) => {
  app.get('/__render-marko-component', (req, res) => {
    const { id, input } = req.query;
    if (!id) throw createError(400, 'The component module id is required.');
    const component = load(id);
    if (!component || (!component.path && !component.meta)) throw createError(400, 'The requested module does not appear to be a Marko component.');
    return res.marko(component, parseJSON(input));
  }, (err, req, res, next) => { // eslint-disable-line
    res.set({ 'content-type': 'text/html; charset=utf-8' });
    res.status(err.status || err.statusCode || 500);
    res.send(`Unable to render marko component. ${err.message}`);
  });
};
