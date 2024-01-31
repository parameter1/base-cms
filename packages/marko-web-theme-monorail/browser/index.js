import GTM from '@parameter1/base-cms-marko-web-gtm/browser';
import GAM from '@parameter1/base-cms-marko-web-gam/browser';
import Search from '@parameter1/base-cms-marko-web-search/browser';
import SocialSharing from '@parameter1/base-cms-marko-web-social-sharing/browser';
import Inquiry from '@parameter1/base-cms-marko-web-inquiry/browser';
import NativeX from '@parameter1/base-cms-marko-web-native-x/browser';
import IdentityX from '@parameter1/base-cms-marko-web-identity-x/browser';
import OmedaIdentityX from '@parameter1/base-cms-marko-web-omeda-identity-x/browser';
import P1Events from '@parameter1/base-cms-marko-web-p1-events/browser';
import IdentityXNewsletterForms from './idx-newsletter-form/index';
import ContentMeterTrack from './content-meter-track.vue';

const CommentToggleButton = () => import(/* webpackChunkName: "theme-comment-toggle-button" */ './comment-toggle-button.vue');
const BlockLoader = () => import(/* webpackChunkName: "theme-block-loader" */ './block-loader.vue');
const InlineNewsletterForm = () => import(/* webpackChunkName: "theme-inline-newsletter-form" */ './inline-newsletter-form.vue');
const MenuToggleButton = () => import(/* webpackChunkName: "theme-menu-toggle-button" */ './menu-toggle-button.vue');
const NewsletterCloseButton = () => import(/* webpackChunkName: "theme-newsletter-close-button" */ './newsletter-close-button.vue');
const NewsletterToggleButton = () => import(/* webpackChunkName: "theme-newsletter-toggle-button" */ './newsletter-toggle-button.vue');
const CompanySearch = () => import(/* webpackChunkName: "theme-company-search" */ './company-search.vue');
const SectionSearch = () => import(/* webpackChunkName: "theme-section-search" */ './section-search.vue');
const SiteNewsletterMenu = () => import(/* webpackChunkName: "theme-site-newsletter-menu" */ './site-newsletter-menu.vue');
const WufooForm = () => import(/* webpackChunkName: "theme-wufoo-form" */ './wufoo-form.vue');
const TopStoriesMenu = () => import(/* webpackChunkName: "theme-top-stories-menu" */ './top-stories-menu.vue');
const RevealAdHandler = () => import(/* webpackChunkName: "reveal-ad-handler" */ './reveal-ad-handler.vue');

const setP1EventsIdentity = ({ p1events, brandKey, encryptedId }) => {
  if (!p1events || !brandKey || !encryptedId) return;
  p1events('setIdentity', `omeda.${brandKey}.customer*${encryptedId}~encrypted`);
};

const dispatchP1EAuthenticate = (args) => {
  const {
    loginSource: actionSource,
    newsletterSignupType,
    contentGatingType,
  } = args;
  window.p1events('track', {
    category: 'Identity',
    action: 'Click',
    label: 'Login Link',
    props: {
      ...(actionSource && { actionSource }),
      ...(newsletterSignupType && { newsletterSignupType }),
      ...(contentGatingType && { contentGatingType }),
    },
  });
};

/**
 * @typedef ThemeConfig
 * @prop {boolean} [enableOmedaIdentityX=true]
 * @prop {boolean} [withP1Events=true]
 * @prop {object} [idxArgs={}]
 * @prop {object} [inquiryArgs={}]
 *
 * @type {ThemeConfig}
 */
const defaultConfig = {
  enableOmedaIdentityX: true,
  withP1Events: true,
  idxArgs: {},
  inquiryArgs: {},
};

/**
 * @param {import('@parameter1/base-cms-marko-web/browser')} Browser
 * @param {ThemeConfig} [configOverrides={}]
 */
export default (Browser, configOverrides = {}) => {
  const config = { ...defaultConfig, ...configOverrides };
  const { EventBus } = Browser;
  const {
    enableOmedaIdentityX,
    withP1Events,
  } = config;

  const idxArgs = config.idxArgs || {};
  const inquiryArgs = config.inquiryArgs || {};

  if (withP1Events) {
    P1Events(Browser);
  }

  /**
   * Sets the P1E Identity and explicitly dispatches the authenticate converion event
   * @see @parameter1/marko-web-p1-events/browser for post-auth conversion events
   */
  if (enableOmedaIdentityX) {
    EventBus.$on('omeda-identity-x-authenticated', (args) => {
      const { brandKey, encryptedId } = args;
      setP1EventsIdentity({ p1events: window.p1events, brandKey, encryptedId });
      dispatchP1EAuthenticate(args);
    });
    EventBus.$on('omeda-identity-x-rapid-identify-response', (args) => {
      const { brandKey, encryptedId } = args;
      setP1EventsIdentity({ p1events: window.p1events, brandKey, encryptedId });
      dispatchP1EAuthenticate(args);
    });
  } else {
    EventBus.$on('identity-x-authenticated', (args) => {
      const { applicationId, user } = args;
      if (!window.p1events || !applicationId || !user) return;
      window.p1events('setIdentity', `identity-x.${applicationId}.app-user*${user.id}`);
      dispatchP1EAuthenticate(args);
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
    OmedaIdentityX(Browser, idxArgs);
  } else {
    IdentityX(Browser, idxArgs);
  }
  IdentityXNewsletterForms(Browser);
  Inquiry(Browser, inquiryArgs);

  Browser.register('ThemeBlockLoader', BlockLoader);

  Browser.register('ThemeSiteNewsletterMenu', SiteNewsletterMenu, {
    provide: { EventBus },
    on: {
      load: (data) => {
        emitNewsletterEvent({ type: 'Pushdown', action: 'Load', data });
        emitNewsletterEvent({ type: 'Pushdown', action: 'View', data });
      },
      focus: (data) => emitNewsletterEvent({ type: 'Pushdown', action: 'Focus', data }),
      submit: (data) => emitNewsletterEvent({ type: 'Pushdown', action: 'Submit', data }),
      subscribe: ({ newsletter }) => emitNewsletterSubscription({ type: 'Pushdown', newsletter }),
      error: (data) => emitNewsletterEvent({ type: 'Pushdown', action: 'Error', data: { ...data, error: data.error.message } }),
    },
  });
  Browser.register('ThemeInlineNewsletterForm', InlineNewsletterForm, {
    on: {
      load: (data) => emitNewsletterEvent({ type: 'Inline', action: 'Load', data }),
      view: (data) => emitNewsletterEvent({ type: 'Inline', action: 'View', data }),
      focus: (data) => emitNewsletterEvent({ type: 'Inline', action: 'Focus', data }),
      submit: (data) => {
        emitNewsletterEvent({ type: 'Inline', action: 'Submit', data });
        if (window.olytics) window.olytics.confirm(data.encryptedCustomerId);
      },
      subscribe: ({ newsletter }) => emitNewsletterSubscription({ type: 'Pushdown', newsletter }),
      error: (data) => emitNewsletterEvent({ type: 'Inline', action: 'Error', data: { ...data, error: data.error.message } }),
    },
  });

  Browser.register('ThemeMenuToggleButton', MenuToggleButton);
  Browser.register('ThemeNewsletterCloseButton', NewsletterCloseButton);

  Browser.register('ThemeNewsletterToggleButton', NewsletterToggleButton, {
    provide: { EventBus },
  });
  Browser.register('ThemeCompanySearch', CompanySearch, {
    provide: { EventBus },
  });
  Browser.register('ThemeSectionSearch', SectionSearch, {
    provide: { EventBus },
  });
  Browser.register('ThemeTopStoriesMenu', TopStoriesMenu);
  Browser.register('WufooForm', WufooForm);
  Browser.register('RevealAdHandler', RevealAdHandler);
  Browser.register('ContentMeterTrack', ContentMeterTrack);
};
