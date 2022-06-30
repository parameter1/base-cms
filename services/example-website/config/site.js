const identityX = require('./identity-x');
const omeda = require('./omeda');
const nativeX = require('./native-x');
const navigation = require('./navigation');
const newsletter = require('./newsletter');

module.exports = {
  identityX,
  nativeX,
  navigation,
  omeda,
  newsletter,
  idxNavItems: { enable: true },
  company: 'Parameter1, LLC',
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
  searchSponsor: {
    navbarLogo: {
      alt: 'Search Sposored by ProfiNet',
      src: 'https://img.automationworld.com/files/base/pmmi/aw/profinet_black.png?h=24&auto=format,compress',
      srcset: [
        'https://img.automationworld.com/files/base/pmmi/aw/profinet_black.png?h=24&auto=format,compress&dpr=2 2x',
      ],
    },
    siteMenuLogo: {
      alt: 'Search Sposored by ProfiNet',
      src: 'https://img.automationworld.com/files/base/pmmi/aw/profinet_black.png?h=34&auto=format,compress',
      srcset: [
        'https://img.automationworld.com/files/base/pmmi/aw/profinet_black.png?h=34&auto=format,compress&dpr=2 2x',
      ],
    },
    pageLogo: {
      alt: 'Search Sposored by ProfiNet',
      src: 'https://img.automationworld.com/files/base/pmmi/aw/profinet_green.png?h=48&auto=format,compress',
      srcset: [
        'https://img.automationworld.com/files/base/pmmi/aw/profinet_green.png?h=48&auto=format,compress&dpr=2 2x',
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
};
