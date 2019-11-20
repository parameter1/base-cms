const { AuthenticationError } = require('apollo-server-express');
const userService = require('./user-service');
const UserContext = require('./context');

module.exports = async ({ req }) => {
  const authorization = req.get('authorization');
  if (!authorization) return new UserContext();

  if (!/^Bearer /.test(authorization)) throw new AuthenticationError('Invalid authorization header');
  const { token } = authorization.match(/^Bearer (?<token>.+)/).groups;
  const user = await userService.retrieve(token);
  return new UserContext(user);
};
