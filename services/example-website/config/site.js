const identityX = require('./identity-x');
const omeda = require('./omeda');
const omedaIdentityX = require('./omeda-identity-x');
const nativeX = require('./native-x');
const navigation = require('./navigation');
const newsletter = require('./newsletter');
const search = require('./search');
const contentMeter = require('./content-meter');

module.exports = {
  auth0: {
    baseURL: process.env.AUTH0_BASEURL,
    clientID: process.env.AUTH0_CLIENTID,
    clientSecret: process.env.AUTH0_SECRET,
    issuerBaseURL: process.env.AUTH0_ISSUER_URL,
  },
  contentMeter,
  omedaIdentityX,
  identityX,
  nativeX,
  navigation,
  omeda,
  newsletter,
  search,
  idxNavItems: { enable: true },
  company: 'Parameter1, LLC',
  mindful: {
    namespace: 'im/default',
  },
  p1events: {
    enabled: true,
    tenant: 'p1',
    cookieDomain: 'dev.parameter1.com',
  },
  idxOnProductHooks: {
    onUserProfileUpdate: {
      productIds: [33],
      promoCode: 'OV_registration_meter',
    },
  },
  logos: {
    navbar: {
      src: 'https://p1-cms-assets.imgix.net/files/base/p1/sandbox/image/static/sandbox-logo.png?h=45&auto=format,compress',
      srcset: [
        'https://p1-cms-assets.imgix.net/files/base/p1/sandbox/image/static/sandbox-logo.png?h=90&auto=format,compress 2x',
      ],
    },
    footer: {
      src: 'https://p1-cms-assets.imgix.net/files/base/p1/sandbox/image/static/sandbox-logo.png?h=60&auto=format,compress',
      srcset: [
        'https://p1-cms-assets.imgix.net/files/base/p1/sandbox/image/static/sandbox-logo.png?h=120&auto=format,compress 2x',
      ],
    },
  },
  socialMediaLinks: [
    { provider: 'facebook', href: 'https://www.facebook.com/parameter1tech', target: '_blank' },
    { provider: 'twitter', href: 'https://www.twitter.com/parameter1tech', target: '_blank' },
    { provider: 'linkedin', href: 'https://www.linkedin.com/company/parameter1', target: '_blank' },
    { provider: 'github', href: 'https://github.com/parameter1', target: '_blank' },
  ],
  inquiry: {
    enabled: true,
    directSend: false,
    sendTo: 'contact@parameter1.com',
    sendFrom: 'parameter1.dev <noreply@parameter1.com>',
    logo: '',
    bgColor: '#000',
  },
  gtm: { containerId: 'GTM-T9BBXZK' },
};
