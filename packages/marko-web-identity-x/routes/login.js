const gql = require('graphql-tag');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const userFragment = require('../api/fragments/active-user');

const buildQuery = () => gql`
  query LoginCheckAppUser($email: String!) {
    appUser(input: { email: $email }) {
      ...ActiveUserFragment
    }
  }
  ${userFragment}
`;

const forceProfileReVerificationUser = gql`
  mutation ForceRevalidateAppUser($input: ForceProfileReVerificationAppUserMutationInput!) {
    forceProfileReVerificationAppUser(input: $input) {
      id
      forceProfileReVerification
    }
  }
`;

module.exports = asyncRoute(async (req, res) => {
  const { identityX, body } = req;
  const {
    email,
    source,
    redirectTo,
    additionalEventData = {},
  } = body;
  const variables = { email };
  const { forceProfileReVerification } = additionalEventData;
  const query = buildQuery();
  const { data } = await identityX.client.query({ query, variables });
  let { appUser } = data;

  if (!appUser) {
    // Create the user.
    appUser = await identityX.createAppUser({ email });
  }

  if (forceProfileReVerification) {
    const { id } = appUser;
    await identityX.client.mutate({
      mutation: forceProfileReVerificationUser,
      variables: { input: { id } },
    });
  }

  // Send login link.
  await identityX.sendLoginLink({
    appUser,
    source,
    redirectTo,
    additionalEventData,
  });
  return res.json({ ok: true, additionalEventData });
});
