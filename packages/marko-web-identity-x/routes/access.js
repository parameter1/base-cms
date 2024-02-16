const gql = require('graphql-tag');
const { asyncRoute } = require('@parameter1/base-cms-utils');

const mutation = gql`
  mutation StoreContentAccessSubmission($input: CreateContentAccessSubmissionMutationInput!) {
    createContentAccessSubmission(input:$input) {
      id
    }
  }
`;

module.exports = asyncRoute(async (req, res) => {
  /** @type {import('../middleware').IdentityXRequest} */
  const { body, apollo, identityX } = req;
  const { contentId, payload, cookie } = body;
  const input = {
    contentId,
    payload,
    ipAddress: req.ip,
  };
  const { name: COOKIE_NAME, maxAge } = cookie;
  await apollo.mutate({ mutation, variables: { input } });
  res.cookie(COOKIE_NAME, true, { maxAge, httpOnly: false });
  const entity = await identityX.generateEntityId();
  res.json({
    ok: true,
    entity,
  });
});
