const gql = require('graphql-tag');

const query = gql`
  query WebsiteRedirect($input: WebsiteRedirectQueryInput!) {
    websiteRedirect(input: $input) {
      to
      code
    }
  }
`;

/**
 * @param {object} req The Express request object.
 * @param {function} [handler] An optional redirect handler to execute if no redirect was found.
 *                             Must return an object of `{ to, code }` or `null`
 * @param {object} app The Express app object.
 */
module.exports = async (req, handler, app) => {
  const { apollo, path, query: params } = req;
  const from = path.replace(/\/$/, '');
  const variables = { input: { from, params } };
  const { data } = await apollo.query({ query, variables });
  const { websiteRedirect } = data;
  const { to } = websiteRedirect || {};
  if (to) return websiteRedirect;
  // Attempt to find a redirect using the handler.
  if (typeof handler !== 'function') return null;
  const result = await handler({
    from,
    params,
    req,
    app,
  });
  if (!result || !result.to) return null;
  return { ...result, code: result.code || 301 };
};
