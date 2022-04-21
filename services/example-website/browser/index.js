import Browser from '@parameter1/base-cms-marko-web/browser';
import OmedaIdentityX from '@parameter1/base-cms-marko-web-omeda-identity-x/browser';

OmedaIdentityX(Browser);

const { EventBus } = Browser;
const { log } = console;

[
  'identity-x-authenticate-displayed',
  'identity-x-authenticate-errored',
  'identity-x-authenticated',
  'identity-x-comment-post-errored',
  'identity-x-comment-post-submitted',
  'identity-x-comment-report-errored',
  'identity-x-comment-report-submitted',
  'identity-x-comment-stream-displayed',
  'identity-x-comment-stream-errored',
  'identity-x-comment-stream-loaded-more',
  'identity-x-comment-stream-loaded',
  'identity-x-comment-stream-login-link-sent',
  'identity-x-login-displayed',
  'identity-x-login-errored',
  'identity-x-login-link-sent',
  'identity-x-logout-displayed',
  'identity-x-logout-errored',
  'identity-x-logout',
  'identity-x-profile-displayed',
  'identity-x-profile-errored',
  'identity-x-profile-updated',
].forEach(event => EventBus.$on(event, args => log('Intercepted event', event, args)));

export default Browser;
