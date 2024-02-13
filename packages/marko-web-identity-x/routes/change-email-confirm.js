const gql = require('graphql-tag');
const jwt = require('jsonwebtoken');
const { get } = require('@parameter1/base-cms-object-path');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const tokenCookie = require('../utils/token-cookie');
const contextCookie = require('../utils/context-cookie');
const callHooksFor = require('../utils/call-hooks-for');
const userFragment = require('../api/fragments/active-user');

const mutation = gql`
  mutation ChangeEmailConfirm($input: ChangeAppUserEmailMutationInput!) {
    changeAppUserEmail(input: $input) {
      token {
        id
        value
      }
      user {
        ...ActiveUserFragment
      }
    }
  }

  ${userFragment}
`;

module.exports = asyncRoute(async (req, res) => {
  /** @type {import('../middleware').IdentityXRequest} */
  const { identityX, body } = req;
  const { token } = body;
  const loginSource = 'change-email';
  if (!token) throw new Error('No login token was provided.');

  const input = { token };
  const variables = { input };
  const { data = {} } = await identityX.client.mutate({ mutation, variables });
  const { token: authToken, user } = data.changeAppUserEmail;

  const decoded = await jwt.decode(token);
  await callHooksFor(identityX, 'onChangeEmailSuccess', {
    user,
    oldEmail: get(decoded, 'data.email'),
  });

  // call authentication hooks
  await callHooksFor(identityX, 'onAuthenticationSuccess', {
    req,
    res,
    user,
    authToken,
    loginSource,
  });
  tokenCookie.setTo(res, authToken.value);
  contextCookie.setTo(res, { loginSource });
  res.json({ ok: true, user });
});
