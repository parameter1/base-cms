const gql = require('graphql-tag');
const { asyncRoute } = require('@parameter1/base-cms-utils');

const mutation = gql`
  mutation CreateComment($input: CreateCommentMutationInput!) {
    createComment(input: $input) {
      id
    }
  }
`;

module.exports = asyncRoute(async (req, res) => {
  /** @type {import('../middleware').IdentityXRequest} */
  const { identityX } = req;
  const { displayName, body, stream } = req.body;

  const input = { displayName, body, stream };
  const variables = { input };
  await identityX.client.mutate({ mutation, variables });
  const entity = await identityX.generateEntityId();
  res.json({
    ok: true,
    entity,
  });
});
