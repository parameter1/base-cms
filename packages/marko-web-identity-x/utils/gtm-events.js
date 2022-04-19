/* eslint-disable no-undef */
export const loginSubmit = ({ event = 'login' }) => {
  const dataLayer = window.dataLayerIdentityX;
  if (dataLayer) dataLayer.push({ event });
};

export const profileView = ({ event = 'profile_view' }) => {
  const dataLayer = window.dataLayerIdentityX;
  if (dataLayer) dataLayer.push({ event });
};

export const profileSubmit = ({ event = 'profile_submit', userId }) => {
  const dataLayer = window.dataLayerIdentityX;
  if (dataLayer) dataLayer.push({ event, userId });
};
