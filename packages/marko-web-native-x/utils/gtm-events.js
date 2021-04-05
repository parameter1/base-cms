/* eslint-disable no-undef */
export const pageLoad = () => {
  const dataLayer = window.dataLayerNativeX;
  if (dataLayer) dataLayer.push({ event: 'page_load' });
};

export const outboundLink = (url) => {
  const dataLayer = window.dataLayerNativeX;
  if (dataLayer) dataLayer.push({ event: 'outbound_click', outbound_url: url, eventTimeout: 3000 });
};

export const share = (provider) => {
  const dataLayer = window.dataLayerNativeX;
  if (dataLayer) dataLayer.push({ event: 'share', social_provider: provider });
};

export const endOfContent = () => {
  const dataLayer = window.dataLayerNativeX;
  if (dataLayer) dataLayer.push({ event: 'scroll_to_bottom' });
};
