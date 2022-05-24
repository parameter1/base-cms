let recaptchaLoadPromise;
// eslint-disable-next-line consistent-return
const recaptchaLoad = siteKey => new Promise(((resolve) => {
  const loadRecaptchaScript = () => {
    window.onRecaptchaLoadCallback = () => {
      window.dispatchEvent((new Event('recaptchaloaded')));

      resolve();
    };

    const docScripts = document.getElementsByTagName('script')[0];
    const newScript = document.createElement('script');

    newScript.type = 'text/javascript';
    newScript.async = !0;
    newScript.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}&onload=onRecaptchaLoadCallback`;
    docScripts.parentNode.insertBefore(newScript, docScripts);
  };

  if (document.readyState === 'complete') return loadRecaptchaScript();

  if (window.attachEvent) {
    window.attachEvent('onload', loadRecaptchaScript);
  } else {
    window.addEventListener('load', loadRecaptchaScript, !1);
  }
}));

export default async ({ siteKey }) => {
  if (!recaptchaLoadPromise) recaptchaLoadPromise = recaptchaLoad(siteKey);
  return recaptchaLoadPromise;
};
