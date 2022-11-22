const Pushdown = () => import(/* webpackChunkName: "theme-idx-newsletter-form-pushdown" */ './pushdown.vue');
const Inline = () => import(/* webpackChunkName: "theme-idx-newsletter-form-inline" */ './inline.vue');
const NewsletterToggleButton = () => import(/* webpackChunkName: "theme-idx-newsletter-toggle-button" */ './toggle-button.vue');

export default (Browser) => {
  const { EventBus } = Browser;

  const emitNewsletterEvent = ({ type, action, data }) => {
    let label = type;
    if (data && data.type) label = `${label} ${data.type}`;
    if (action === 'Error') label = `${label} Error: ${data.error}`;
    EventBus.$emit('identity-x-newsletter-form-action', {
      ...data,
      category: 'Newsletter Signup Form',
      action,
      label,
    });
  };

  Browser.register('IdentityXNewsletterFormPushdown', Pushdown, {
    provide: { EventBus },
    on: {
      load: (data) => {
        emitNewsletterEvent({ type: 'Pushdown', action: 'Load', data });
        emitNewsletterEvent({ type: 'Pushdown', action: 'View', data });
      },
      focus: data => emitNewsletterEvent({ type: 'Pushdown', action: 'Focus', data }),
      submit: data => emitNewsletterEvent({ type: 'Pushdown', action: 'Submit', data }),
      // subscribe: ({ newsletter }) => emitNewsletterSubscription({ type: 'Pushdown', newsletter })
      error: data => emitNewsletterEvent({ type: 'Pushdown', action: 'Error', data: { ...data, error: data.error.message } }),
    },
  });

  Browser.register('IdentityXNewsletterFormInline', Inline, {
    provide: { EventBus },
    on: {
      load: data => emitNewsletterEvent({ type: 'Inline', action: 'Load', data }),
      view: data => emitNewsletterEvent({ type: 'Inline', action: 'View', data }),
      focus: data => emitNewsletterEvent({ type: 'Inline', action: 'Focus', data }),
      submit: data => emitNewsletterEvent({ type: 'Inline', action: 'Submit', data }),
      // subscribe: ({ newsletter }) => emitNewsletterSubscription({ type: 'Pushdown', newsletter })
      error: data => emitNewsletterEvent({ type: 'Inline', action: 'Error', data: { ...data, error: data.error.message } }),
    },
  });

  Browser.register('IdentityXNewsletterFormFooter', Inline, {
    provide: { EventBus },
    on: {
      load: data => emitNewsletterEvent({ type: 'Inline', action: 'Load', data }),
      view: data => emitNewsletterEvent({ type: 'Inline', action: 'View', data }),
      focus: data => emitNewsletterEvent({ type: 'Inline', action: 'Focus', data }),
      submit: data => emitNewsletterEvent({ type: 'Inline', action: 'Submit', data }),
      // subscribe: ({ newsletter }) => emitNewsletterSubscription({ type: 'Pushdown', newsletter })
      error: data => emitNewsletterEvent({ type: 'Inline', action: 'Error', data: { ...data, error: data.error.message } }),
    },
  });

  Browser.register('IdentityXNewsletterToggleButton', NewsletterToggleButton, {
    provide: { EventBus },
    on: {
      'idx-newsletter-menu-expanded': data => emitNewsletterEvent({ type: 'Menu', action: 'Expand', data }),
    },
  });
};
