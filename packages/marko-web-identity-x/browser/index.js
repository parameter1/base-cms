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
  withGTM = true,
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
      submit: (...args) => { EventBus.$emit('identity-x-profile-updated', ...args); },
    },
  });
  Browser.register('IdentityXCommentStream', CommentStreamComponent);

  if (withGTM) {
    const { dataLayer = [] } = window;
    [
      'identity-x-authenticate-displayed',
      'identity-x-authenticated',
      'identity-x-authenticate-errored',
      'identity-x-login-displayed',
      'identity-x-login-link-sent',
      'identity-x-login-errored',
      'identity-x-logout-displayed',
      'identity-x-logout',
      'identity-x-logout-errored',
    ].forEach((event) => {
      EventBus.$on(event, args => dataLayer.push({
        event,
        'identity-x': {
          ...(args && args),
          event,
          label: args.label,
        },
      }));
    });
  }
};
