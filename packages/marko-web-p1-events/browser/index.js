const TrackLeaders = () => import(/* webpackChunkName: "p1-events-track-leaders" */ './track-leaders.vue');

export default (Browser, { withLeaders = true } = {}) => {
  const { EventBus } = Browser;
  if (withLeaders) Browser.register('P1EventsTrackLeaders', TrackLeaders, { provide: { EventBus } });
};
