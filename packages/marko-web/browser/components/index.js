export const LoadMoreTrigger = () => import(/* webpackChunkName: "load-more-trigger" */ './load-more-trigger.vue');
export const TriggerInViewEvent = () => import(/* webpackChunkName: "trigger-in-view-event" */ './trigger-in-view-event.vue');
export const TriggerScreenChangeEvent = () => import(/* webpackChunkName: "trigger-screen-change-event" */ './trigger-screen-change-event.vue');
export const OEmbed = () => import(/* webpackChunkName: "oembed" */ './oembed.vue');
export const FormDotComGatedDownload = () => import(/* webpackChunkName: "form-dot-com" */ './gated-download/form-dot-com.vue');
export const WufooGatedDownload = () => import(/* webpackChunkName: "wufoo-gated-download" */ './gated-download/wufoo.vue');

export default (Browser) => {
  Browser.register('LoadMoreTrigger', LoadMoreTrigger);
  Browser.register('TriggerInViewEvent', TriggerInViewEvent);
  Browser.register('TriggerScreenChangeEvent', TriggerScreenChangeEvent);
  Browser.register('OEmbed', OEmbed);
  Browser.register('FormDotComGatedDownload', FormDotComGatedDownload);
  Browser.register('WufooGatedDownload', WufooGatedDownload);
};
