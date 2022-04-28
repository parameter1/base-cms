import GTM from '@parameter1/base-cms-marko-web-gtm/browser';
import GAM from '@parameter1/base-cms-marko-web-gam/browser';
import Search from '@parameter1/base-cms-marko-web-search/browser';
import SocialSharing from '@parameter1/base-cms-marko-web-social-sharing/browser';
import Inquiry from '@parameter1/base-cms-marko-web-inquiry/browser';
import NativeX from '@parameter1/base-cms-marko-web-native-x/browser';
import IdentityX from '@parameter1/base-cms-marko-web-identity-x/browser';
import OmedaIdentityX from '@parameter1/base-cms-marko-web-omeda-identity-x/browser';

const CommentToggleButton = () => import(/* webpackChunkName: "theme-comment-toggle-button" */ './comment-toggle-button.vue');
const BlockLoader = () => import(/* webpackChunkName: "theme-block-loader" */ './block-loader.vue');
const InlineNewsletterForm = () => import(/* webpackChunkName: "theme-inline-newsletter-form" */ './inline-newsletter-form.vue');
const MenuToggleButton = () => import(/* webpackChunkName: "theme-menu-toggle-button" */ './menu-toggle-button.vue');
const NewsletterCloseButton = () => import(/* webpackChunkName: "theme-newsletter-close-button" */ './newsletter-close-button.vue');
const NewsletterToggleButton = () => import(/* webpackChunkName: "theme-newsletter-toggle-button" */ './newsletter-toggle-button.vue');

const SiteNewsletterMenu = () => import(/* webpackChunkName: "theme-site-newsletter-menu" */ './site-newsletter-menu.vue');
const WufooForm = () => import(/* webpackChunkName: "theme-wufoo-form" */ './wufoo-form.vue');
const TopStoriesMenu = () => import(/* webpackChunkName: "theme-top-stories-menu" */ './top-stories-menu.vue');

const setP1EventsIdentity = ({ p1events, brandKey, encryptedId }) => {
  if (!p1events || !brandKey || !encryptedId) return;
  p1events('setIdentity', `omeda.${brandKey}.customer*${encryptedId}~encrypted`);
};

export default (Browser, config = {
  enableOmedaIdentityX: true,
  withGTM: true,
  withP1Events: true,
}) => {
  const { EventBus } = Browser;
  const { enableOmedaIdentityX } = config;

  if (enableOmedaIdentityX) {
    EventBus.$on('omeda-identity-x-authenticated', ({ brandKey, encryptedId }) => {
      setP1EventsIdentity({ p1events: window.p1events, brandKey, encryptedId });
    });
    EventBus.$on('omeda-identity-x-rapid-identify-response', ({ brandKey, encryptedId }) => {
      setP1EventsIdentity({ p1events: window.p1events, brandKey, encryptedId });
    });
  }

  Browser.register('ThemeCommentToggleButton', CommentToggleButton);

  EventBus.$on('identity-x-logout', () => {
    if (window.p1events) window.p1events('setIdentity', null);
  });
  const emitNewsletterEvent = ({ type, action, data }) => {
    let label = `Step ${data.step}`;
    if (action === 'Error') label = `${label} Error: ${data.error}`;
    EventBus.$emit('newsletter-form-action', {
      category: `Newsletter Signup Form (${type})`,
      action,
      label,
    });
  };

  const emitNewsletterSubscription = ({ type, newsletter }) => {
    EventBus.$emit('newsletter-form-subscription', {
      category: newsletter.eventCategory || newsletter.name,
      action: type,
    });
  };

  GTM(Browser);
  GAM(Browser);
  Search(Browser);
  SocialSharing(Browser);
  NativeX(Browser);
  if (enableOmedaIdentityX) {
    OmedaIdentityX(Browser);
  } else {
    IdentityX(Browser);
  }
  Inquiry(Browser);

  Browser.register('ThemeBlockLoader', BlockLoader);

  Browser.register('ThemeSiteNewsletterMenu', SiteNewsletterMenu, {
    provide: { EventBus },
    on: {
      load: (data) => {
        emitNewsletterEvent({ type: 'Pushdown', action: 'Load', data });
        emitNewsletterEvent({ type: 'Pushdown', action: 'View', data });
      },
      focus: data => emitNewsletterEvent({ type: 'Pushdown', action: 'Focus', data }),
      submit: data => emitNewsletterEvent({ type: 'Pushdown', action: 'Submit', data }),
      subscribe: ({ newsletter }) => emitNewsletterSubscription({ type: 'Pushdown', newsletter }),
      error: data => emitNewsletterEvent({ type: 'Pushdown', action: 'Error', data: { ...data, error: data.error.message } }),
    },
  });
  Browser.register('ThemeInlineNewsletterForm', InlineNewsletterForm, {
    on: {
      load: data => emitNewsletterEvent({ type: 'Inline', action: 'Load', data }),
      view: data => emitNewsletterEvent({ type: 'Inline', action: 'View', data }),
      focus: data => emitNewsletterEvent({ type: 'Inline', action: 'Focus', data }),
      submit: data => emitNewsletterEvent({ type: 'Inline', action: 'Submit', data }),
      subscribe: ({ newsletter }) => emitNewsletterSubscription({ type: 'Pushdown', newsletter }),
      error: data => emitNewsletterEvent({ type: 'Inline', action: 'Error', data: { ...data, error: data.error.message } }),
    },
  });

  Browser.register('ThemeMenuToggleButton', MenuToggleButton);
  Browser.register('ThemeNewsletterCloseButton', NewsletterCloseButton);

  Browser.register('ThemeNewsletterToggleButton', NewsletterToggleButton, {
    provide: { EventBus },
  });
  Browser.register('ThemeTopStoriesMenu', TopStoriesMenu);
  Browser.register('WufooForm', WufooForm);
};
