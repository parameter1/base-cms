const {
  AuthenticationError,
  ForbiddenError,
} = require('apollo-server-express');
const UserContext = require('./context');

const expression = /^Bearer (?<token>.+)/;

module.exports = async ({ req, userService }) => {
  const authorization = req.get('authorization');
  if (!authorization) return new UserContext();

  if (!expression.test(authorization)) throw new AuthenticationError('The provided credentials are invalid.');
  const { token } = authorization.match(expression).groups;
  try {
    const user = await userService.checkAuth(token);
    return new UserContext({ user, token });
  } catch (e) {
    throw new ForbiddenError('The provided credentials are no longer valid.');
  }
};
