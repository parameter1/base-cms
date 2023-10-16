import IdentityX from './service';
import createGraphqlClient from './graphql/create-client';

const Access = () => import(/* webpackChunkName: "identity-x-form-access" */ './access.vue');
const Authenticate = () => import(/* webpackChunkName: "identity-x-authenticate" */ './authenticate.vue');
const ChangeEmailConfirm = () => import(/* webpackChunkName: "identity-x-change-email-confirm" */ './change-email-confirm.vue');
const ChangeEmailInit = () => import(/* webpackChunkName: "identity-x-change-email-init" */ './change-email-init.vue');
const Download = () => import(/* webpackChunkName: "identity-x-download" */ './download.vue');
const Logout = () => import(/* webpackChunkName: "identity-x-logout" */ './logout.vue');
const Login = () => import(/* webpackChunkName: "identity-x-login" */ './login.vue');
const Profile = () => import(/* webpackChunkName: "identity-x-profile" */ './profile.vue');
const Progressive = () => import(/* webpackChunkName: "identity-x-progressive" */ './progressive.vue');
const CommentStream = () => import(/* webpackChunkName: "identity-x-comment-stream" */ './comments/stream.vue');

const $graphql = createGraphqlClient({ uri: '/__graphql' });

const { log } = console;

export default (Browser, {
  CustomAccessComponent,
  CustomAuthenticateComponent,
  CustomChangeEmailConfirmComponent,
  CustomChangeEmailInitComponent,
  CustomCommentStreamComponent,
  CustomDownloadComponent,
  CustomLoginComponent,
  CustomLogoutComponent,
  CustomProfileComponent,
  CustomProgressiveComponent,
} = {}) => {
  const AccessComponent = CustomAccessComponent || Access;
  const AuthenticateComponent = CustomAuthenticateComponent || Authenticate;
  const ChangeEmailConfirmComponent = CustomChangeEmailConfirmComponent || ChangeEmailConfirm;
  const ChangeEmailInitComponent = CustomChangeEmailInitComponent || ChangeEmailInit;
  const CommentStreamComponent = CustomCommentStreamComponent || CommentStream;
  const DownloadComponent = CustomDownloadComponent || Download;
  const LoginComponent = CustomLoginComponent || Login;
  const LogoutComponent = CustomLogoutComponent || Logout;
  const ProfileComponent = CustomProfileComponent || Profile;
  const ProgressiveComponent = CustomProgressiveComponent || Progressive;

  window.IdentityX = new IdentityX();

  const { EventBus } = Browser;
  Browser.register('IdentityXAccess', AccessComponent, { provide: { EventBus, $graphql } });
  Browser.register('IdentityXAuthenticate', AuthenticateComponent, { provide: { EventBus } });
  Browser.register('IdentityXChangeEmailConfirm', ChangeEmailConfirmComponent, { provide: { EventBus } });
  Browser.register('IdentityXChangeEmailInit', ChangeEmailInitComponent, { provide: { EventBus } });
  Browser.register('IdentityXCommentStream', CommentStreamComponent, { provide: { EventBus } });
  Browser.register('IdentityXDownload', DownloadComponent, { provide: { EventBus, $graphql } });
  Browser.register('IdentityXLogin', LoginComponent, { provide: { EventBus } });
  Browser.register('IdentityXLogout', LogoutComponent, { provide: { EventBus } });
  Browser.register('IdentityXProfile', ProfileComponent, { provide: { EventBus } });
  Browser.register('IdentityXProgressive', ProgressiveComponent, { provide: { EventBus } });

  // Ensure the client-side IdX context is refreshed when the authentication event occurs
  EventBus.$on('identity-x-authenticated', () => window.IdentityX.refreshContext());

  // Send emitted IdentityX events to the datalayer
  window.dataLayer = window.dataLayer || [];
  [
    // Views
    'identity-x-access-mounted',
    'identity-x-authenticate-mounted',
    'identity-x-change-email-mounted',
    'identity-x-comment-create-mounted',
    'identity-x-comment-post-mounted',
    'identity-x-comment-stream-mounted',
    'identity-x-download-mounted',
    'identity-x-login-mounted',
    'identity-x-logout-mounted',
    'identity-x-profile-mounted',
    'identity-x-progressive-mounted',
    // Actions/submissions
    'identity-x-access-submitted',
    'identity-x-authenticated',
    'identity-x-auto-signup',
    'identity-x-change-email',
    'identity-x-comment-post-submitted',
    'identity-x-comment-report-submitted',
    'identity-x-comment-stream-loaded',
    'identity-x-comment-stream-loaded-more',
    'identity-x-download-submitted',
    'identity-x-login-link-sent',
    'identity-x-logout',
    'identity-x-profile-updated',
    'identity-x-progressive-updated',
    // Errors
    'identity-x-access-errored',
    'identity-x-authenticate-errored',
    'identity-x-change-email-errored',
    'identity-x-comment-post-errored',
    'identity-x-comment-report-errored',
    'identity-x-comment-stream-errored',
    'identity-x-download-errored',
    'identity-x-login-errored',
    'identity-x-logout-errored',
    'identity-x-profile-errored',
    'identity-x-progressive-errored',
  ].forEach((event) => {
    EventBus.$on(event, (args) => {
      if (!window.IdentityX) return;
      const payload = {
        event,
        'identity-x': {
          ...args,
          event,
        },
      };
      const { searchParams } = new URL(window.location.href);
      if (searchParams.has('idxDebugger')) {
        log(`identity-x event: ${event} `, payload);
      }
      window.dataLayer.push(payload);
    });
  });
};
