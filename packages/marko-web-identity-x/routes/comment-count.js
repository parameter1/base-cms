const gql = require('graphql-tag');
const { asyncRoute } = require('@parameter1/base-cms-utils');

const query = gql`
  query CountComments($identifier: String!) {
    commentsForStream(input: { identifier: $identifier }) {
      totalCount
    }
  }
`;

module.exports = asyncRoute(async (req, res) => {
  /** @type {import('../middleware').IdentityXRequest} */
  const { identityX } = req;
  const { identifier } = req.params;
  const variables = { identifier };
  const { data } = await identityX.client.query({ query, variables });
  res.json(data.commentsForStream);
});
