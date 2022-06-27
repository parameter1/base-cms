const Pushdown = () => import(/* webpackChunkName: "theme-idx-newsletter-form-pushdown" */ './pushdown.vue');
const Inline = () => import(/* webpackChunkName: "theme-idx-newsletter-form-inline" */ './inline.vue');

export default (Browser) => {
  const { EventBus } = Browser;

  Browser.register('IdentityXNewsletterFormPushdown', Pushdown, {
    provide: { EventBus },
  });

  Browser.register('IdentityXNewsletterFormInline', Inline, {
    provide: { EventBus },
  });

  Browser.register('IdentityXNewsletterFormFooter', Inline, {
    provide: { EventBus },
  });
};
