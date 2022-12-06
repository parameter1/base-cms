const TrackContentBodyLinks = () => import(/* webpackChunkName: "p1-events-track-content-body-links" */ './track-content-body-links.vue');
const TrackInquirySubmission = () => import(/* webpackChunkName: "p1-events-track-inquiry-submission" */ './track-inquiry-submission.vue');

export default (Browser) => {
  const { EventBus } = Browser;
  Browser.register('P1EventsTrackContentBodyLinks', TrackContentBodyLinks);
  Browser.register('P1EventsTrackInquirySubmission', TrackInquirySubmission, {
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
