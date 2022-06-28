const defaults = {
  name: 'Don’t Miss Out',
  description: 'Get the business tips, industry insights and trending news every user needs to know in the <span class="newsletter-name">Sandbox</span> newsletter.',
  privacyPolicy: { href: '/page/terms-conditions', label: 'Terms & Conditions' },
};

module.exports = {
  // uses inline omeda form
  signupBanner: {
    ...defaults,
    imagePath: 'files/base/p1/sandbox/image/static/newsletter-phone-full.png',
  },
  pushdown: {
    ...defaults,
    imagePath: 'files/base/p1/sandbox/image/static/newsletter-phone-half.png',
  },

  // links off to seperate omeda dragonform
  signupBannerLarge: {
    ...defaults,
  },
  signupFooter: {
    ...defaults,
  },
};
