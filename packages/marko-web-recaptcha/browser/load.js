const onWindowLoad = (callback) => {
  if (document.readyState === 'complete') {
    requestAnimationFrame(callback);
  } else {
    window.addEventListener('load', function fn() {
      window.removeEventListener('load', fn);
      requestAnimationFrame(callback);
    });
  }
};

const loadScript = (siteKey) => new Promise(((resolve, reject) => {
  const callback = () => {
    window.onRecaptchaLoadCallback = resolve;
    const body = document.getElementsByTagName('body')[0];
    const script = document.createElement('script');
    script.onerror = reject;
    script.type = 'text/javascript';
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}&onload=onRecaptchaLoadCallback`;
    body.appendChild(script);
  };

  onWindowLoad(callback);
}));

export default async ({ siteKey }) => {
  if (!siteKey) throw new Error('The recaptcha site key is required to the load script.');
  if (!window.recaptchaLoadPromise) window.recaptchaLoadPromise = loadScript(siteKey);
  return window.recaptchaLoadPromise;
};
