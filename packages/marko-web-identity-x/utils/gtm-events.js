/* eslint-disable no-undef */
export const loginSubmit = ({ event = 'login', email }) => {
  console.log('gtm-event-login-submit: ', event);
  const dataLayer = window.dataLayerIdentityX;
  if (dataLayer) dataLayer.push({ event, email });
};

export const profileView = ({ event = 'profile_view' }) => {
  console.log('gtm-event-profile-view: ', event);
  const dataLayer = window.dataLayerIdentityX;
  if (dataLayer) dataLayer.push({ event });
};

export const profileSubmit = ({ event = 'update_profile', email }) => {
  console.log('gtm-event-profile-submit: ', event);
  const dataLayer = window.dataLayerIdentityX;
  if (dataLayer) dataLayer.push({ event, email });
};
