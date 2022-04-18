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

const sendLoginLink = gql`
  mutation LoginSendLoginLink($input: SendAppUserLoginLinkMutationInput!) {
    sendAppUserLoginLink(input: $input)
  }
`;

module.exports = asyncRoute(async (req, res) => {
  const { identityX, body } = req;
  const {
    email,
    authUrl,
    redirectTo,
    appContextId,
    additionalEventData = {},
  } = body;
  const variables = { email };
  const query = buildQuery();
  const { data } = await identityX.client.query({ query, variables });
  let { appUser } = data;


  if (!appUser) {
    // Create the user.
    const { data: newUser } = await identityX.client.mutate({ mutation: createUser, variables });
    appUser = newUser.createAppUser;
  }

  // Send login link.
  await identityX.client.mutate({
    mutation: sendLoginLink,
    variables: {
      input: {
        email: appUser.email,
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
