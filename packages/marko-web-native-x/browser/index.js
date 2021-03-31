const TrackNativeXStoryPageView = () => import(/* webpackChunkName: "native-x-story-track-page-view" */ './track-page-view.vue');

export default (Browser) => {
  Browser.register('TrackNativeXStoryPageView', TrackNativeXStoryPageView);
};
