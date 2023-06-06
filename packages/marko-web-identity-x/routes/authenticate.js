const gql = require('graphql-tag');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const tokenCookie = require('../utils/token-cookie');
const contextCookie = require('../utils/context-cookie');
const callHooksFor = require('../utils/call-hooks-for');
const userFragment = require('../api/fragments/active-user');

const loginAppUser = gql`
  mutation LoginAppUser($input: LoginAppUserMutationInput!) {
    loginAppUser(input: $input) {
      token {
        id
        value
      }
      user {
        ...ActiveUserFragment
      }
      loginSource
      loginSourceType
    }
  }

  ${userFragment}
`;

module.exports = asyncRoute(async (req, res) => {
  const { identityX, body } = req;
  const { token, additionalEventData } = body;
  if (!token) throw new Error('No login token was provided.');

  const input = { token };
  const variables = { input };
  const { data = {} } = await identityX.client.mutate({ mutation: loginAppUser, variables });
  const {
    token: authToken,
    user,
    loginSource,
    loginSourceType,
  } = data.loginAppUser;

  // call authentication hooks
  await callHooksFor(identityX, 'onAuthenticationSuccess', {
    req,
    res,
    user,
    authToken,
    loginSource,
    additionalEventData,
  });
  tokenCookie.setTo(res, authToken.value);
  contextCookie.setTo(res, { loginSource });
  contextCookie.setTo(res, { loginSourceType });
  if (loginSourceType) additionalEventData.loginSourceType = loginSourceType;
  res.json({
    ok: true,
    user,
    loginSource,
    loginSourceType,
    additionalEventData,
  });
});
