export default ({ siteKey, action }) => {
  if (!siteKey) throw new Error('The recaptcha site key is required');
  if (!action) throw new Error('The recaptcha action is required');
  return window.grecaptcha.execute(siteKey, { action });
};
