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

const mobileMenu = {
  primary: topics.primary,
  secondary: topics.secondary,
};

const desktopMenu = {
  about: [...utilities],
  user: [],
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
