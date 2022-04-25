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

  // Send emitted IdentityX events to the datalayer
  window.dataLayer = window.dataLayer || [];
  [
    // Views
    'identity-x-authenticate-displayed',
    'identity-x-comment-stream-displayed',
    'identity-x-login-displayed',
    'identity-x-logout-displayed',
    'identity-x-profile-displayed',
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
  ].forEach((event) => {
    EventBus.$on(event, args => window.dataLayer.push({
      event,
      'identity-x': {
        ...(args && args),
        event,
        label: args.label,
      },
    }));
  });
};
