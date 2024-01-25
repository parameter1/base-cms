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
  const { body, apollo } = req;
  const { contentId, payload } = body;
  const input = {
    contentId,
    payload,
    ipAddress: req.ip,
  };
  await apollo.mutate({ mutation, variables: { input } });
  res.json({ ok: true });
});
