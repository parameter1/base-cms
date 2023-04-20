import IdentityX from './service';

const Authenticate = () => import(/* webpackChunkName: "identity-x-authenticate" */ './authenticate.vue');
const ChangeEmailConfirm = () => import(/* webpackChunkName: "identity-x-change-email-confirm" */ './change-email-confirm.vue');
const ChangeEmailInit = () => import(/* webpackChunkName: "identity-x-change-email-init" */ './change-email-init.vue');
const Logout = () => import(/* webpackChunkName: "identity-x-logout" */ './logout.vue');
const Login = () => import(/* webpackChunkName: "identity-x-login" */ './login.vue');
const Profile = () => import(/* webpackChunkName: "identity-x-profile" */ './profile.vue');
const CommentStream = () => import(/* webpackChunkName: "identity-x-comment-stream" */ './comments/stream.vue');

export default (Browser, {
  CustomAuthenticateComponent,
  CustomChangeEmailConfirmComponent,
  CustomChangeEmailInitComponent,
  CustomCommentStreamComponent,
  CustomLoginComponent,
  CustomLogoutComponent,
  CustomProfileComponent,
} = {}) => {
  const AuthenticateComponent = CustomAuthenticateComponent || Authenticate;
  const ChangeEmailConfirmComponent = CustomChangeEmailConfirmComponent || ChangeEmailConfirm;
  const ChangeEmailInitComponent = CustomChangeEmailInitComponent || ChangeEmailInit;
  const CommentStreamComponent = CustomCommentStreamComponent || CommentStream;
  const LoginComponent = CustomLoginComponent || Login;
  const LogoutComponent = CustomLogoutComponent || Logout;
  const ProfileComponent = CustomProfileComponent || Profile;

  window.IdentityX = new IdentityX();

  const { EventBus } = Browser;
  Browser.register('IdentityXAuthenticate', AuthenticateComponent, { provide: { EventBus } });
  Browser.register('IdentityXChangeEmailConfirm', ChangeEmailConfirmComponent, { provide: { EventBus } });
  Browser.register('IdentityXChangeEmailInit', ChangeEmailInitComponent, { provide: { EventBus } });
  Browser.register('IdentityXCommentStream', CommentStreamComponent, { provide: { EventBus } });
  Browser.register('IdentityXLogin', LoginComponent, { provide: { EventBus } });
  Browser.register('IdentityXLogout', LogoutComponent, { provide: { EventBus } });
  Browser.register('IdentityXProfile', ProfileComponent, { provide: { EventBus } });

  // Ensure the client-side IdX context is refreshed when the authentication event occurs
  EventBus.$on('identity-x-authenticated', () => window.IdentityX.refreshContext());

  // Send emitted IdentityX events to the datalayer
  window.dataLayer = window.dataLayer || [];
  [
    // Views
    'identity-x-authenticate-mounted',
    'identity-x-comment-stream-mounted',
    'identity-x-comment-post-mounted',
    'identity-x-comment-create-mounted',
    'identity-x-login-mounted',
    'identity-x-logout-mounted',
    'identity-x-profile-mounted',
    // Actions/submissions
    'identity-x-authenticated',
    'identity-x-auto-signup',
    'identity-x-comment-post-submitted',
    'identity-x-comment-report-submitted',
    'identity-x-comment-stream-loaded',
    'identity-x-comment-stream-loaded-more',
    'identity-x-login-link-sent',
    'identity-x-logout',
    'identity-x-profile-updated',
    // Errors
    'identity-x-authenticate-errored',
    'identity-x-comment-post-errored',
    'identity-x-comment-report-errored',
    'identity-x-comment-stream-errored',
    'identity-x-login-errored',
    'identity-x-logout-errored',
    'identity-x-profile-errored',
  ].forEach((event) => {
    EventBus.$on(event, (args) => {
      if (!window.IdentityX) return;
      window.dataLayer.push({
        event,
        'identity-x': {
          ...args,
          event,
        },
      });
    });
  });
};
