module.exports = {
  Query: {
    activeUser: (_, __, { auth }) => auth.getUser(),

    /**
     * @param {void} _
     * @param {object} args
     * @param {string} args.value
     * @param {import("../../../routes/graphql").GraphQLServerContext} contextValue
     */
    async isUserAuthTokenValid(_, { value }, { userService }) {
      try {
        await userService.checkAuth(value);
        return true;
      } catch (e) {
        return false;
      }
    },
  },
  Mutation: {
    login: (_, { input }, { userService }) => {
      const { username, password } = input;
      return userService.login(username, password);
    },
    logout: (_, __, { userService, auth }) => userService.logout(auth.getToken()),
  },
};
