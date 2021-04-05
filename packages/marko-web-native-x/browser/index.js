const NativeXTrackEndOfContent = () => import(/* webpackChunkName: "native-x-track-end-of-content" */ './track-end-of-content.vue');
const NativeXTrackSocialShare = () => import(/* webpackChunkName: "native-x-track-social-share" */ './track-social-share.vue');
const NativeXTrackOutboundLinks = () => import(/* webpackChunkName: "native-x-track-outbound-links" */ './track-outbound-links.vue');

export default (Browser) => {
  const { EventBus } = Browser;
  Browser.register('NativeXTrackEndOfContent', NativeXTrackEndOfContent);
  Browser.register('NativeXTrackSocialShare', NativeXTrackSocialShare, { provide: { EventBus } });
  Browser.register('NativeXTrackOutboundLinks', NativeXTrackOutboundLinks);
};
