const gql = require('graphql-tag');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const callHooksFor = require('../utils/call-hooks-for');
const userFragment = require('../api/fragments/active-user');

const buildQuery = () => gql`
  query LoginCheckAppUser($email: String!) {
    appUser(input: { email: $email }) {
      ...ActiveUserFragment
    }
  }
  ${userFragment}
`;

const createUser = gql`
  mutation LoginCreateAppUser($email: String!) {
    createAppUser(input: { email: $email }) {
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

const sendLoginLink = gql`
  mutation LoginSendLoginLink($input: SendAppUserLoginLinkMutationInput!) {
    sendAppUserLoginLink(input: $input)
  }
`;

module.exports = asyncRoute(async (req, res) => {
  const { identityX, body } = req;
  const {
    email,
    source,
    authUrl,
    redirectTo,
    appContextId,
    additionalEventData = {},
  } = body;
  const variables = { email };
  const { forceProfileReVerification } = additionalEventData;
  const query = buildQuery();
  const { data } = await identityX.client.query({ query, variables });
  let { appUser } = data;

  if (!appUser) {
    // Create the user.
    const { data: newUser } = await identityX.client.mutate({ mutation: createUser, variables });
    appUser = newUser.createAppUser;
  }

  if (forceProfileReVerification) {
    const { id } = appUser;
    await identityX.client.mutate({
      mutation: forceProfileReVerificationUser,
      variables: { input: { id } },
    });
  }

  // Send login link.
  await identityX.client.mutate({
    mutation: sendLoginLink,
    variables: {
      input: {
        email: appUser.email,
        source,
        authUrl,
        redirectTo,
        appContextId,
      },
    },
  });
  await callHooksFor(identityX, 'onLoginLinkSent', {
    ...(additionalEventData || {}),
    req,
    user: appUser,
  });
  return res.json({ ok: true });
});
