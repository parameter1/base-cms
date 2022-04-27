import IdentityX from './service';

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

  window.IdentityX = new IdentityX();

  const { EventBus } = Browser;
  Browser.register('IdentityXAuthenticate', AuthenticateComponent, { provide: { EventBus } });
  Browser.register('IdentityXLogin', LoginComponent, { provide: { EventBus } });
  Browser.register('IdentityXLogout', LogoutComponent, { provide: { EventBus } });
  Browser.register('IdentityXProfile', ProfileComponent, { provide: { EventBus } });
  Browser.register('IdentityXCommentStream', CommentStreamComponent, { provide: { EventBus } });

  // Ensure the client-side IdX context is refreshed when the authentication event occurs
  EventBus.$on('identity-x-authenticated', () => window.IdentityX.loadContext());
};
