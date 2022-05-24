const privacyPolicy = require('./privacy-policy');

const baseConfig = {
  action: 'https://randallreilly.dragonforms.com/loading.do',
  hiddenInputs: [
    { name: 'omedasite', value: 'ov_subscriptions' },
  ],
};

const defaults = {
  name: 'Don’t Miss Out',
  description: 'Get the business tips, industry insights and trending news every owner-operator needs to know in the <span class="newsletter-name">Overdrive</span> newsletter.',
  defaultNewsletter: {
    deploymentTypeId: 33,
    name: 'Overdrive Daily Newsletter',
    eventCategory: 'Daily Newsletter Subscription',
  },
  privacyPolicy,
  newsletters: [
    {
      deploymentTypeId: 35,
      name: 'Custom Rigs Weekly Newsletter',
      description: 'Great photos and stories of the coolest rigs out there',
      eventCategory: 'Custom Rigs Subscription',
    },
    {
      deploymentTypeId: 85,
      name: 'Overdrive Monthly Gear Newsletter',
      description: 'The best products for owner-operators',
      eventCategory: 'Monthly Gear Subscription',
    },
    {
      deploymentTypeId: 63,
      name: 'Overdrive Weekly Newsletter',
      description: 'The most important news of the week in trucking',
      eventCategory: 'Weekly Newsletter Subscription',
    },
  ],
  demographic: {
    id: 241,
    label: 'Your primary role?',
    values: [
      { id: 380, label: 'Owner/Operator leased to a for-hire carrier' },
      { id: 381, label: 'Owner with own authority to haul freight (for-hire)' },
      { id: 382, label: 'Owner not for hire, with vocational business' },
      { id: 379, label: 'Company Driver' },
      { id: 383, label: 'School' },
      { id: 384, label: 'Other' },
    ],
  },
};

module.exports = {
  // uses inline omeda form
  signupBanner: {
    ...defaults,
    imagePath: 'files/base/randallreilly/all/image/static/newsletter-pushdown/ovd-full.png',
  },
  pushdown: {
    ...defaults,
    description: 'Join 135,000 owner-operators who get helpful insights and important news delivered straight to their inbox with the <span class="newsletter-name">Overdrive</span> newsletter.',
    imagePath: 'files/base/randallreilly/all/image/static/newsletter-pushdown/ovd-half.png',
  },

  // links off to seperate omeda dragonform
  signupBannerLarge: {
    ...baseConfig,
    name: 'Don’t Miss Out',
    description: 'Get the business tips, industry insights and trending news every owner-operator needs to know in the <span class="newsletter-name">Overdrive</span> newsletter.',
  },
  signupFooter: {
    ...baseConfig,
    name: 'Newsletter Just for Owner-Operators',
    description: 'Get owner-operator news and insights, plus diesel prices and gear reviews — delivered straight to your inbox.',
  },
};
