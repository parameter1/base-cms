const TrackContentBodyLinks = () => import(/* webpackChunkName: "p1-events-track-content-body-links" */ './track-content-body-links.vue');
const TrackPageViewDepth = () => import(/* webpackChunkName: "p1-events-track-page-view-depth" */ './track-page-view-depth.vue');
const TrackDownloadSubmission = () => import(/* webpackChunkName: "p1-events-track-download-submission" */ './track-download-submission.vue');
const TrackInquirySubmission = () => import(/* webpackChunkName: "p1-events-track-inquiry-submission" */ './track-inquiry-submission.vue');

export default (Browser) => {
  const { EventBus } = Browser;
  Browser.register('P1EventsTrackContentBodyLinks', TrackContentBodyLinks);
  Browser.register('P1EventsTrackPageViewDepth', TrackPageViewDepth);
  Browser.register('P1EventsTrackInquirySubmission', TrackInquirySubmission, {
    provide: { EventBus },
  });

  Browser.register('P1EventsTrackDownloadSubmission', TrackDownloadSubmission, {
    provide: { EventBus },
  });

  // Provide raw event tracking for integrated services
  EventBus.$on('identity-x-newsletter-form-action', (props) => {
    if (!window.p1events) return;
    const { category, action, label } = props;
    // Other standard props: ctx, entity, props
    const { ctx, entity } = props;
    window.p1events('track', {
      category,
      action,
      label,
      ctx,
      entity,
    });
  });
};
