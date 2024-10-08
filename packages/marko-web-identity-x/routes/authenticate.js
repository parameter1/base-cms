const gql = require('graphql-tag');
const { getAsObject } = require('@parameter1/base-cms-object-path');
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
      additionalContext
    }
  }

  ${userFragment}
`;

module.exports = asyncRoute(async (req, res) => {
  /** @type {import('../middleware').IdentityXRequest} */
  const { identityX, body } = req;
  const { token, additionalEventData } = body;
  if (!token) throw new Error('No login token was provided.');

  const input = { token };
  const variables = { input };
  const { data = {} } = await identityX.client.mutate({ mutation: loginAppUser, variables });
  const { token: authToken, user, loginSource } = data.loginAppUser;

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
  identityX.setIdentityCookie(user.id);
  const entity = await identityX.generateEntityId({ userId: user.id });
  const refreshed = await identityX.findUserById(user.id);
  res.json({
    ok: true,
    applicationId: identityX.config.getAppId(),
    user: refreshed,
    loginSource,
    additionalContext: getAsObject(data, 'loginAppUser.additionalContext'),
    additionalEventData,
    entity,
  });
});
