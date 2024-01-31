import Browser from '@parameter1/base-cms-marko-web/browser';
import Leaders from '@parameter1/base-cms-marko-web-leaders/browser';
import MonoRail from '@parameter1/base-cms-marko-web-theme-monorail/browser';
import ContactUs from '@parameter1/base-cms-marko-web-contact-us/browser';

MonoRail(Browser);
Leaders(Browser);
ContactUs(Browser);

const { EventBus } = Browser;
const { log } = console;

[
  // Views
  'identity-x-authenticate-mounted',
  'identity-x-change-email-mounted',
  'identity-x-comment-create-mounted',
  'identity-x-comment-post-mounted',
  'identity-x-comment-stream-mounted',
  'identity-x-access-mounted',
  'identity-x-download-mounted',
  'identity-x-login-mounted',
  'identity-x-logout-mounted',
  'identity-x-profile-mounted',
  // Actions/submissions
  'identity-x-authenticated',
  'identity-x-auto-signup',
  'identity-x-change-email',
  'identity-x-comment-post-submitted',
  'identity-x-comment-report-submitted',
  'identity-x-comment-stream-loaded',
  'identity-x-comment-stream-loaded-more',
  'identity-x-download-submitted',
  'identity-x-access-submitted',
  'identity-x-login-link-sent',
  'identity-x-logout',
  'identity-x-profile-updated',
  // Errors
  'identity-x-authenticate-errored',
  'identity-x-change-email-errored',
  'identity-x-comment-post-errored',
  'identity-x-comment-report-errored',
  'identity-x-comment-stream-errored',
  'identity-x-download-errored',
  'identity-x-access-errored',
  'identity-x-login-errored',
  'identity-x-logout-errored',
  'identity-x-profile-errored',
  // Newsletter forms (Monorail)
  'identity-x-newsletter-form-action',
  // Omeda
  'omeda-identity-x-authenticated',
  'omeda-identity-x-rapid-identify-encrypted-id-found',
  'omeda-identity-x-rapid-identify-response',
].forEach((event) => EventBus.$on(event, (args) => log('Emitted event', event, args)));

export default Browser;
