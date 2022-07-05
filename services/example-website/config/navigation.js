const idxConfig = require('./identity-x');

const topics = {
  primary: [
    { href: '/clients', label: 'Clients' },
    { href: '/markets', label: 'Markets' },
    { href: '/products', label: 'Products' },
    { href: '/services', label: 'Services' },
  ],
  secondary: [
    { href: '/leaders', label: 'Leaders' },
    { href: '/directory', label: 'Directory' },
    { href: '/Sponsored', label: 'Sponsored' },
  ],
};

const utilities = [
  { href: '/page/about', label: 'About' },
  { href: '/page/advertise', label: 'Advertise' },
  { href: '/page/contact-us', label: 'Contact Us' },
];

const userLinks = [
  {
    href: idxConfig.getEndpointFor('login'),
    label: 'Sign In',
    when: 'logged-out',
    modifiers: ['user'],
  },
  {
    href: idxConfig.getEndpointFor('profile'),
    label: 'Manage Account',
    when: 'logged-in',
    modifiers: ['user'],
  },
  {
    href: idxConfig.getEndpointFor('logout'),
    label: 'Sign Out',
    when: 'logged-in',
    modifiers: ['user'],
  },
];

const mobileMenu = {
  user: userLinks,
  primary: topics.primary,
  secondary: topics.secondary,
};

const desktopMenu = {
  about: [...utilities],
  user: userLinks,
  sections: [
    ...topics.primary,
    ...topics.secondary,
  ],
};

module.exports = {
  desktopMenu,
  mobileMenu,
  primary: {
    items: [],
  },
  secondary: {
    items: topics.primary,
  },
  tertiary: {
    items: [],
  },
  footer: {
    items: [
      { href: '/page/terms-conditions', label: 'Terms & Conditions' },
      { href: '/page/privacy-policy', label: 'Privacy Policy' },
      { href: '/page/contact-us', label: 'Contact Us' },
      { href: '/site-map', label: 'Site Map' },
    ],
    topics: topics.primary,
    more: [
      ...utilities,
    ],
  },
};
