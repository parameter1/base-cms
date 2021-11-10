const gql = require('graphql-tag');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const callHooksFor = require('../utils/call-hooks-for');

const buildQuery = () => gql`
  query LoginCheckAppUser($email: String!) {
    appUser(input: { email: $email }) {
      id
      email
      verified
    }
  }
`;

const createUser = gql`
  mutation LoginCreateAppUser($email: String!) {
    createAppUser(input: { email: $email }) {
      id
      email
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
    authUrl,
    redirectTo,
    appContextId,
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
  await callHooksFor(identityX, 'onLoginLinkSent', { req, user: appUser });
  return res.json({ ok: true });
});
