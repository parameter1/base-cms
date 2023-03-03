const createError = require('http-errors');
const MostPopular = require('../components/blocks/most-popular');
const MostPopularList = require('../components/blocks/most-popular-list');
const TopStoriesMenu = require('../components/blocks/top-stories-menu');

const blocks = {
  'most-popular': MostPopular,
  'most-popular-list': MostPopularList,
  'top-stories-menu': TopStoriesMenu,
};

const parseJSON = (value) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return {};
  }
};

module.exports = (app) => {
  app.get('/__render-block/:name', (req, res) => {
    const { name } = req.params;
    const input = parseJSON(req.query.input);
    const Component = blocks[name];
    if (!Component) throw createError(404, `No block component found for '${name}'`);
    return res.marko(Component, input);
  }, (err, req, res, next) => { // eslint-disable-line
    res.set({ 'content-type': 'text/html; charset=utf-8' });
    res.status(err.status || err.statusCode || 500);
    res.send(`Unable to render marko component. ${err.message}`);
  });
};
