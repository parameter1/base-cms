const onAuthenticationSuccess = require('./on-authentication-success');
const onLoginLinkSent = require('./on-login-link-sent');
const onLogout = require('./on-logout');
const onUserProfileUpdate = require('./on-user-profile-update');

module.exports = {
  onAuthenticationSuccess,
  onLoginLinkSent,
  onLogout,
  onUserProfileUpdate,
};
