const NativeXTrackEndOfContent = () => import(/* webpackChunkName: "native-x-track-end-of-content" */ './track-end-of-content.vue');
const NativeXTrackSocialShare = () => import(/* webpackChunkName: "native-x-track-social-share" */ './track-social-share.vue');

export default (Browser) => {
  const { EventBus } = Browser;
  Browser.register('NativeXTrackEndOfContent', NativeXTrackEndOfContent);
  Browser.register('NativeXTrackSocialShare', NativeXTrackSocialShare, { provide: { EventBus } });
};
