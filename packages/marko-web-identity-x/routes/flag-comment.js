const gql = require('graphql-tag');
const { asyncRoute } = require('@parameter1/base-cms-utils');

const mutation = gql`
  mutation FlagComment($id: String!) {
    setCommentFlagged(input: { id: $id, value: true }) {
      id
      flagged
    }
  }
`;

module.exports = asyncRoute(async (req, res) => {
  /** @type {import('../middleware').IdentityXRequest} */
  const { identityX } = req;
  const { id } = req.params;
  const variables = { id };
  await identityX.client.mutate({ mutation, variables });
  const entity = await identityX.generateEntityId();
  res.json({ ok: true, entity });
});
