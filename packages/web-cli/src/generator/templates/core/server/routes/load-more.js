const { withLoadMore } = require('@parameter1/base-cms-marko-web/middleware');

// Register blocks that support load more...
const blocks = {};

module.exports = (app) => {
  app.get('/load-more/:blockName', withLoadMore({
    blocks,
  }));
};
