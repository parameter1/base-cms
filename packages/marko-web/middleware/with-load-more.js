const { asyncRoute } = require('@parameter1/base-cms-utils');
const LoadMore = require('../components/load-more/index.marko');

module.exports = () => asyncRoute(async (req, res) => {
  const { method, query, body } = req;
  const data = method === 'POST' ? JSON.parse(body) : query;
  const input = JSON.parse(data.input || null) || {};
  res.marko(LoadMore, input);
});
