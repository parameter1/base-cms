const { apolloClient } = require('@parameter1/base-cms-express-apollo');
const { parseBooleanHeader } = require('@parameter1/base-cms-utils');

module.exports = (app, uri, config = {}) => {
  /**
   * Force sets GraphQL cache headers when cookies are present on the site.
   * This can either force enable cache when globally disabled, or force disable cache
   * when globally enabled.
   */
  const contextFn = ({ req }) => {
    const headers = ['x-cache-site-context', 'x-cache-responses'].reduce((o, key) => {
      const value = req.query[key] || req.cookies[key];
      if (!value) return o; // do nothing if no cookie or query param is set.
      // otherwise parse the value and set the GraphQL header to match.
      return { ...o, [key]: parseBooleanHeader(value) };
    }, {});
    return { headers };
  };
  app.use(apolloClient(uri, config, config.link, contextFn));
};
