export default (siteKey, action = 'formWithReCAPTCHASubmit') => window.grecaptcha.execute(siteKey, {
  action,
});
