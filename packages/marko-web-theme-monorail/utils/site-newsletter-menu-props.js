const { buildImgixUrl } = require('@parameter1/base-cms-image');
const { getAsObject } = require('@parameter1/base-cms-object-path');

module.exports = ({ out }) => {
  const { site, config, recaptcha } = out.global;
  const {
    name,
    description,
    imagePath,
    defaultNewsletter,
    newsletters,
    demographic,
    disabled,
    step1CtaLabel,
    step2CtaLabel,
    privacyPolicy,
  } = site.getAsObject('newsletter.pushdown');

  const lang = site.config.lang || 'en';
  const { initiallyExpanded } = getAsObject(out.global, 'newsletterState');
  const imageSrc = imagePath ? buildImgixUrl(`https://${config.website('imageHost')}/${imagePath}`, { w: 280, auto: 'format,compress' }) : null;
  const imageSrcset = imageSrc ? `${imageSrc}&dpr=2 2x` : null;

  return {
    siteName: config.website('name'),
    name,
    description,
    defaultNewsletter,
    newsletters,
    demographic,
    disabled,
    imageSrc,
    imageSrcset,
    initiallyExpanded,
    step1CtaLabel,
    step2CtaLabel,
    recaptchaSiteKey: recaptcha.siteKey,
    privacyPolicyLink: privacyPolicy,
    lang,
  };
};
