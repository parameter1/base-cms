const NativeXTrackEndOfContent = () => import(/* webpackChunkName: "native-x-track-end-of-content" */ './track-end-of-content.vue');

export default (Browser) => {
  Browser.register('NativeXTrackEndOfContent', NativeXTrackEndOfContent);
};
