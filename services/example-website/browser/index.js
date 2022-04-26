import Browser from '@parameter1/base-cms-marko-web/browser';
import OmedaIdentityX from '@parameter1/base-cms-marko-web-omeda-identity-x/browser';

OmedaIdentityX(Browser);

const { EventBus } = Browser;
const { log } = console;

[
  // Views
  'identity-x-authenticate-mounted',
  'identity-x-comment-stream-mounted',
  'identity-x-login-mounted',
  'identity-x-logout-mounted',
  'identity-x-profile-mounted',
  // Actions/submissions
  'identity-x-authenticated',
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
].forEach(event => EventBus.$on(event, args => log('Intercepted event', event, args)));

export default Browser;
