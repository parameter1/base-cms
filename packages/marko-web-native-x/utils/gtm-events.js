export const pageLoad = (window) => {
  const dataLayer = window.dataLayerNativeX || [];
  dataLayer.push({ event: 'page_load' });
};

export const outboundLink = (window, url) => {
  const dataLayer = window.dataLayerNativeX || [];
  dataLayer.push({ event: 'outbound_click', outbound_url: url, eventTimeout: 3000 });
};

export const share = (window, provider) => {
  const dataLayer = window.dataLayerNativeX || [];
  dataLayer.push({ event: 'share', social_provider: provider });
};

export const endOfContent = (window) => {
  const dataLayer = window.dataLayerNativeX || [];
  dataLayer.push({ event: 'scroll_to_bottom' });
};
