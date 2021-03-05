const TrackContentBodyLinks = () => import(/* webpackChunkName: "p1-events-track-content-body-links" */ './track-content-body-links.vue');
const TrackInquirySubmission = () => import(/* webpackChunkName: "p1-events-track-inquiry-submission" */ './track-inquiry-submission.vue');

export default (Browser) => {
  const { EventBus } = Browser;
  Browser.register('P1EventsTrackContentBodyLinks', TrackContentBodyLinks);
  Browser.register('P1EventsTrackInquirySubmission', TrackInquirySubmission, {
    provide: { EventBus },
  });
};
