const onAuthenticationSuccess = require('./on-authentication-success');
const onLoadActiveContext = require('./on-load-active-context');
const onLoginLinkSent = require('./on-login-link-sent');
const onLogout = require('./on-logout');
const onUserProfileUpdate = require('./on-user-profile-update');

module.exports = {
  onAuthenticationSuccess,
  onLoadActiveContext,
  onLoginLinkSent,
  onLogout,
  onUserProfileUpdate,
};
