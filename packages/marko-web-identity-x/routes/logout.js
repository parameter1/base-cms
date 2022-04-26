const gql = require('graphql-tag');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const contextCookie = require('../utils/context-cookie');
const tokenCookie = require('../utils/token-cookie');
const userFragment = require('../api/fragments/active-user');
const callHooksFor = require('../utils/call-hooks-for');

const logoutAppUser = gql`
  mutation LogoutAppUser($input: LogoutAppUserWithDataMutationInput!) {
    logoutAppUserWithData(input: $input) {
      ...ActiveUserFragment
    }
  }
  ${userFragment}
`;

module.exports = asyncRoute(async (req, res) => {
  const { identityX } = req;
  contextCookie.removeFrom(res);
  const token = tokenCookie.getFrom(req);
  if (!token) {
    await callHooksFor(identityX, 'onLogout', { req, res });
    res.json({ ok: true });
  } else {
    const input = { token };
    const variables = { input };
    const { data } = await identityX.client.mutate({ mutation: logoutAppUser, variables });
    tokenCookie.removeFrom(res);
    await callHooksFor(identityX, 'onLogout', { req, res, user: data.logoutAppUserWithData });
    res.json({ ok: true });
  }
});
