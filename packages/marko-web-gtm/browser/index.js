const GTMTrackInViewEvent = () => import(/* webpackChunkName: "gtm-track-in-view-event" */ './track-in-view-event.vue');
const GTMTrackLoadMore = () => import(/* webpackChunkName: "gtm-track-load-more" */ './track-load-more.vue');
const GTMTrackBusEvent = () => import(/* webpackChunkName: "gtm-track-bus-event" */ './track-bus-event.vue');

export default (Browser) => {
  const { EventBus } = Browser;
  Browser.register('GTMTrackInViewEvent', GTMTrackInViewEvent);
  Browser.register('GTMTrackLoadMore', GTMTrackLoadMore, {
    provide: { EventBus },
  });
  Browser.register('GTMTrackBusEvent', GTMTrackBusEvent, {
    provide: { EventBus },
  });
};
