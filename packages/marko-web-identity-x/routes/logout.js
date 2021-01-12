const gql = require('graphql-tag');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const tokenCookie = require('../utils/token-cookie');

const logoutAppUser = gql`
  mutation LogoutAppUser($input: LogoutAppUserMutationInput!) {
    logoutAppUser(input: $input)
  }
`;

module.exports = asyncRoute(async (req, res) => {
  const { identityX } = req;
  const token = tokenCookie.getFrom(req);
  if (!token) {
    res.json({ ok: true });
  } else {
    const input = { token };
    const variables = { input };
    await identityX.client.mutate({ mutation: logoutAppUser, variables });
    tokenCookie.removeFrom(res);
    res.json({ ok: true });
  }
});
