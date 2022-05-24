export default ({
  siteKey,
  action,
} = {
  action: 'formWithReCAPTCHASubmit',
}) => window.grecaptcha.execute(siteKey, { action });
