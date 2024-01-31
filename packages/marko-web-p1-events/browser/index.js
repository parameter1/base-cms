const TrackContentBodyLinks = () => import(/* webpackChunkName: "p1-events-track-content-body-links" */ './track-content-body-links.vue');
const TrackScrollDepth = () => import(/* webpackChunkName: "p1-events-track-scroll-depth" */ './track-scroll-depth.vue');
const TrackDownloadSubmission = () => import(/* webpackChunkName: "p1-events-track-download-submission" */ './track-download-submission.vue');
const TrackInquirySubmission = () => import(/* webpackChunkName: "p1-events-track-inquiry-submission" */ './track-inquiry-submission.vue');

export default (Browser) => {
  const { EventBus } = Browser;
  Browser.register('P1EventsTrackContentBodyLinks', TrackContentBodyLinks);
  Browser.register('P1EventsTrackScrollDepth', TrackScrollDepth);
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

  // User Conversion Events
  [...new Map([
    ['identity-x-access-submitted', {
      category: 'Identity',
      action: 'Submit',
      label: 'Content Access',
    }],
    ['identity-x-download-submitted', {
      category: 'Identity',
      action: 'Submit',
      label: 'Content Download',
    }],
    ['identity-x-login-link-sent', {
      category: 'Identity',
      action: 'Sent',
      label: 'Login Link',
    }],
    ['identity-x-profile-updated', {
      category: 'Identity',
      action: 'Submit',
      label: 'Profile',
    }],
  ]).entries()].forEach(([event, payload]) => {
    EventBus.$on(event, (args) => {
      if (!window.p1events) return;
      const { actionSource, newsletterSignupType, contentGatingType } = args;
      window.p1events('track', {
        ...payload,
        props: {
          ...(actionSource && { actionSource }),
          ...(newsletterSignupType && { newsletterSignupType }),
          ...(contentGatingType && { contentGatingType }),
        },
      });
    });
  });
};
