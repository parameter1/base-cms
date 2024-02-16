const gql = require('graphql-tag');
const { asyncRoute } = require('@parameter1/base-cms-utils');

const mutation = gql`
  mutation StoreContentDownloadSubmission($input: CreateContentDownloadSubmissionMutationInput!) {
    createContentDownloadSubmission(input:$input) {
      id
    }
  }
`;

module.exports = asyncRoute(async (req, res) => {
  /** @type {import('../middleware').IdentityXRequest} */
  const { body, apollo, identityX } = req;
  const { contentId, payload } = body;
  const input = {
    contentId,
    payload,
    ipAddress: req.ip,
  };
  await apollo.mutate({ mutation, variables: { input } });
  const entity = await identityX.generateEntityId();
  res.json({
    ok: true,
    entity,
  });
});
