export default siteKey => window.grecaptcha.execute(siteKey, {
  action: 'newsletterSignup',
});
