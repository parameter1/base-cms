const LeadersProgram = () => import(/* webpackChunkName: "leaders-program" */ '@parameter1/base-cms-leaders-program');
const LeadersClickEmitter = () => import(/* webpackChunkName: "leaders-click-emitter" */ './click-emitter.vue');
const LeadersCompanyWebsiteLink = () => import(/* webpackChunkName: "leaders-company-website-link" */ './company-website-link.vue');
const LeadersCompanySocialLink = () => import(/* webpackChunkName: "leaders-company-social-link" */ './company-social-link.vue');
const LeadersGTMTracker = () => import(/* webpackChunkName: "leaders-gtm-tracker" */ './gtm-tracker.vue');


export default (Browser, { withGTM = true } = {}) => {
  const { EventBus } = Browser;
  if (withGTM) Browser.register('LeadersGTMTracker', LeadersGTMTracker, { provide: { EventBus } });
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
  Browser.register('LeadersClickEmitter', LeadersClickEmitter, {
    on: { action: (...args) => EventBus.$emit('leaders-action', ...args) },
  });
};
