const Authenticate = () => import(/* webpackChunkName: "identity-x-authenticate" */ './authenticate.vue');
const Logout = () => import(/* webpackChunkName: "identity-x-logout" */ './logout.vue');
const Login = () => import(/* webpackChunkName: "identity-x-login" */ './login.vue');
const Profile = () => import(/* webpackChunkName: "identity-x-profile" */ './profile.vue');
const CommentStream = () => import(/* webpackChunkName: "identity-x-comment-stream" */ './comments/stream.vue');

export default (Browser, {
  CustomLoginComponent,
  CustomAuthenticateComponent,
  CustomLogoutComponent,
  CustomProfileComponent,
  CustomCommentStreamComponent,
} = {}) => {
  const LoginComponent = CustomLoginComponent || Login;
  const AuthenticateComponent = CustomAuthenticateComponent || Authenticate;
  const LogoutComponent = CustomLogoutComponent || Logout;
  const ProfileComponent = CustomProfileComponent || Profile;
  const CommentStreamComponent = CustomCommentStreamComponent || CommentStream;

  const { EventBus } = Browser;
  Browser.register('IdentityXAuthenticate', AuthenticateComponent, {
    on: {
      displayed: (...args) => { EventBus.$emit('identity-x-authenticate-displayed', ...args); },
      submitted: (...args) => { EventBus.$emit('identity-x-authenticated', ...args); },
      errored: (...args) => { EventBus.$emit('identity-x-authenticate-errored', ...args); },
    },
  });
  Browser.register('IdentityXLogin', LoginComponent, {
    on: {
      displayed: (...args) => { EventBus.$emit('identity-x-login-displayed', ...args); },
      submitted: (...args) => { EventBus.$emit('identity-x-login-link-sent', ...args); },
      errored: (...args) => { EventBus.$emit('identity-x-login-errored', ...args); },
    },
  });
  Browser.register('IdentityXLogout', LogoutComponent, {
    on: {
      displayed: (...args) => { EventBus.$emit('identity-x-logout-displayed', ...args); },
      submitted: (...args) => { EventBus.$emit('identity-x-logout', ...args); },
      errored: (...args) => { EventBus.$emit('identity-x-logout-errored', ...args); },
    },
  });
  Browser.register('IdentityXProfile', ProfileComponent, {
    on: {
      displayed: (...args) => { EventBus.$emit('identity-x-profile-displayed', ...args); },
      submitted: (...args) => { EventBus.$emit('identity-x-profile-updated', ...args); },
      errored: (...args) => { EventBus.$emit('identity-x-profile-errored', ...args); },
    },
  });
  Browser.register('IdentityXCommentStream', CommentStreamComponent, {
    on: {
      'post-errored': (...args) => { EventBus.$emit('identity-x-comment-post-errored', ...args); },
      'post-submitted': (...args) => { EventBus.$emit('identity-x-comment-post-submitted', ...args); },
      'report-errored': (...args) => { EventBus.$emit('identity-x-comment-report-errored', ...args); },
      'report-submitted': (...args) => { EventBus.$emit('identity-x-comment-report-submitted', ...args); },
      displayed: (...args) => { EventBus.$emit('identity-x-comment-stream-displayed', ...args); },
      errored: (...args) => { EventBus.$emit('identity-x-stream-errored', ...args); },
      loaded: (...args) => { EventBus.$emit('identity-x-comment-stream-loaded', ...args); },
      'loaded-more': (...args) => { EventBus.$emit('identity-x-comment-stream-loaded-more', ...args); },
      'login-link-sent': (...args) => { EventBus.$emit('identity-x-comment-stream-login-link-sent', ...args); },
    },
  });

};
