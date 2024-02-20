const authenticate = require('./authenticate');
const changeEmail = require('./change-email');
const login = require('./login');
const logout = require('./logout');
const profile = require('./profile');
const progressive = require('./progressive');

module.exports = {
  authenticate,
  changeEmail,
  login,
  logout,
  profile,
  progressive,
};
