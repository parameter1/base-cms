const { buildImgixUrl } = require('@parameter1/base-cms-image');
const { get } = require('@parameter1/base-cms-object-path');
const defaultValue = require('@parameter1/base-cms-marko-core/utils/default-value');

module.exports = ({ out, input }) => {
  const { config, site, req } = out.global;
  const { user, application } = input;
  const { identityX } = req;
  const additionalEventData = defaultValue(input.additionalEventData, {});
  const buttonLabels = defaultValue(input.buttonLabels, { continue: 'Sign Up' });
  const loginEmailPlaceholder = defaultValue(input.loginEmailPlaceholder, 'example@gmail.com');
  const source = defaultValue(input.source, 'newsletterSignup');
  const configName = defaultValue(input.configName, 'signupBanner');
  const newsletterSignupType = defaultValue(input.type, 'default');
  const validTypes = ['inlineContent', 'inlineSection', 'footer', 'modal'];
  const withImage = defaultValue(input.withImage, true);

  if (!validTypes.includes(newsletterSignupType)) {
    console.log(`Unknown inline signup type. One of ${validTypes} expected!`);
  }

  const {
    name,
    description,
    imagePath,
    disabled,
  } = site.getAsObject(`newsletter.${configName}`);

  const lang = site.config.lang || 'en';
  const imageSrc = imagePath ? buildImgixUrl(`https://${config.website('imageHost')}/${imagePath}`, { w: 120, auto: 'format,compress' }) : null;
  const imageSrcset = imageSrc ? `${imageSrc}&dpr=2 2x` : null;

  return {
    ...((withImage && imageSrc) && { imageSrc }),
    ...((withImage && imageSrcset) && { imageSrcset }),
    imageWidth: defaultValue(input.imageWidth, ''),
    imageHeight: defaultValue(input.imageHeight, ''),
    siteName: config.website('name'),
    name,
    description,
    disabled,
    lang,
    additionalEventData,
    source,
    type: newsletterSignupType,
    activeUser: user,
    endpoints: identityX.config.getEndpoints(),
    buttonLabels,
    redirect: input.redirect,
    loginEmailPlaceholder,
    loginEmailLabel: input.loginEmailLabel,
    modifiers: input.modifiers,
    actionText: input.actionText,
    consentPolicy: input.consentPolicy || get(application, 'organization.consentPolicy'),
    emailConsentRequest: get(application, 'organization.emailConsentRequest'),
    regionalConsentPolicies: get(application, 'organization.regionalConsentPolicies'),
    appContextId: identityX.config.get('appContextId'),
    requiredCreateFields: identityX.config.getRequiredCreateFields(),
    defaultFieldLabels: identityX.config.get('defaultFieldLabels'),
  };
};
