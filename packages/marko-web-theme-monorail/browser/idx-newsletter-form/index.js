const Pushdown = () => import(/* webpackChunkName: "theme-idx-newsletter-form-pushdown" */ './pushdown.vue');
const Inline = () => import(/* webpackChunkName: "theme-idx-newsletter-form-inline" */ './inline.vue');

export default (Browser) => {
  const { EventBus } = Browser;

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

  Browser.register('IdentityXNewsletterFormPushdown', Pushdown, {
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

  Browser.register('IdentityXNewsletterFormInline', Inline, {
    provide: { EventBus },
    on: {
      load: data => emitNewsletterEvent({ type: 'Inline', action: 'Load', data }),
      view: data => emitNewsletterEvent({ type: 'Inline', action: 'View', data }),
      focus: data => emitNewsletterEvent({ type: 'Inline', action: 'Focus', data }),
      submit: (data) => {
        emitNewsletterEvent({ type: 'Inline', action: 'Submit', data });
        if (window.olytics) window.olytics.confirm(data.encryptedCustomerId);
      },
      subscribe: ({ newsletter }) => emitNewsletterSubscription({ type: 'Inline', newsletter }),
      error: data => emitNewsletterEvent({ type: 'Inline', action: 'Error', data: { ...data, error: data.error.message } }),
    },
  });

  Browser.register('IdentityXNewsletterFormFooter', Inline, {
    provide: { EventBus },
    on: {
      load: data => emitNewsletterEvent({ type: 'Footer', action: 'Load', data }),
      view: data => emitNewsletterEvent({ type: 'Footer', action: 'View', data }),
      focus: data => emitNewsletterEvent({ type: 'Footer', action: 'Focus', data }),
      submit: (data) => {
        emitNewsletterEvent({ type: 'Footer', action: 'Submit', data });
        if (window.olytics) window.olytics.confirm(data.encryptedCustomerId);
      },
      subscribe: ({ newsletter }) => emitNewsletterSubscription({ type: 'Footer', newsletter }),
      error: data => emitNewsletterEvent({ type: 'Footer', action: 'Error', data: { ...data, error: data.error.message } }),
    },
  });
};
