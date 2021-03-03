const LeadersProgram = () => import(/* webpackChunkName: "leaders-program" */ '@parameter1/base-cms-leaders-program');
const LeadersCompanyWebsiteLink = () => import(/* webpackChunkName: "leaders-company-website-link" */ './company-website-link.vue');
const LeadersCompanySocialLink = () => import(/* webpackChunkName: "leaders-company-social-link" */ './company-social-link.vue');
const LeadersGTMTracker = () => import(/* webpackChunkName: "leaders-gtm-tracker" */ './gtm-tracker.vue');
const LeadersP1EventsTracker = () => import(/* webpackChunkName: "leaders-p1-event-tracker" */ './p1events-tracker.vue');


export default (Browser, { withGTM = true, withP1Events = true } = {}) => {
  const { EventBus } = Browser;
  if (withGTM) Browser.register('LeadersGTMTracker', LeadersGTMTracker, { provide: { EventBus } });
  if (withP1Events) Browser.register('LeadersP1EventsTracker', LeadersP1EventsTracker, { provide: { EventBus } });
  Browser.register('LeadersProgram', LeadersProgram, {
    withApollo: true,
    on: { action: (...args) => EventBus.$emit('leaders-action', ...args) },
  });
  Browser.register('LeadersCompanyWebsiteLink', LeadersCompanyWebsiteLink, {
    on: { action: (...args) => EventBus.$emit('leaders-action', ...args) },
  });
  Browser.register('LeadersCompanySocialLink', LeadersCompanySocialLink, {
    on: { action: (...args) => EventBus.$emit('leaders-action', ...args) },
  });
};
