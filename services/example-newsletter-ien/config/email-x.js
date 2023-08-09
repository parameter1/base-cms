const EmailXConfiguration = require('@parameter1/base-cms-marko-newsletters-email-x/config');

const config = new EmailXConfiguration(process.env.EMAILX_SERVE_URI || 'https://roguemonkeymedia.serve.email-x.parameter1.com');

config
  .setAdUnits('fm-today', [
    {
      name: 'header',
      id: '5ddd5531c044ef4d6c9d4055',
      width: 600,
      height: 100,
      uri: 'https://email-serve.foodmanufacturing.com',
    },
  ])

  .setAdUnits('fm-weekly', [
    {
      name: 'header',
      id: '605b8eec5e9bb64609f9cbf8',
      width: 600,
      height: 100,
      uri: 'https://email-serve.foodmanufacturing.com',
    },
  ])

  .setAdUnits('id-today', [
    {
      name: 'header',
      id: '5ddd570255da06ed43436a55',
      width: 600,
      height: 100,
      uri: 'https://email-serve.inddist.com',
    },
  ])

  .setAdUnits('impo-insider', [
    {
      name: 'header',
      id: '5ddd57f0c044efa60c9d40cd',
      width: 600,
      height: 100,
      uri: 'https://email-serve.impomag.com',
    },
  ])

  .setAdUnits('manufacturing-today', [
    {
      name: 'header',
      id: '5ddd585b55da06bd77436acd',
      width: 600,
      height: 100,
      uri: 'https://email-serve.manufacturing.net',
    },
  ])

  .setAdUnits('manufacturing-today-safety', [
    {
      name: 'header',
      id: '6043e527ae663a568e5a27b9',
      width: 600,
      height: 100,
      uri: 'https://email-serve.manufacturing.net',
    },
  ])

  .setAdUnits('newswire', [
    {
      name: 'header',
      id: '5dde9e8255da064bc9436c26',
      width: 600,
      height: 100,
      uri: 'https://email-serve.manufacturing.net',
    },
  ])

  .setAdUnits('cen-today', [
    {
      name: 'header',
      id: '5c7fd6b6dd5ae7933a8d03c4',
      width: 600,
      height: 100,
      uri: 'https://email-serve.cannabisequipmentnews.com',
    },
  ])

  .setAdUnits('design-development-update', [
    {
      name: 'header',
      id: '5c7fd61044d39f5560b85eed',
      width: 600,
      height: 100,
      uri: 'https://email-serve.designdevelopmenttoday.com',
    },
  ])

  .setAdUnits('design-development-weekly', [
    {
      name: 'header',
      id: '6058f5e15e9bb68489f9c9dc',
      width: 600,
      height: 100,
      uri: 'https://email-serve.designdevelopmenttoday.com',
    },
  ])

  .setAdUnits('design-development-today', [
    {
      name: 'header',
      id: '5c7fd480dd5ae7f7fb8d037b',
      width: 600,
      height: 100,
      uri: 'https://email-serve.designdevelopmenttoday.com',
    },
  ])

  .setAdUnits('ien-today', [
    {
      name: 'header',
      id: '5c7fd8a7dd5ae704948d03fb',
      width: 600,
      height: 100,
      uri: 'https://email-serve.ien.com',
    },
  ])
  .setAdUnits('ien-today-refresh', [
    {
      name: 'header',
      id: '5c7fd8a7dd5ae704948d03fb',
      width: 600,
      height: 100,
      uri: 'https://email-serve.ien.com',
    },
  ])
  .setAdUnits('ien-weekly', [
    {
      name: 'header',
      id: '5e41bd4bc9c827744d3bd55b',
      width: 600,
      height: 100,
      uri: 'https://email-serve.ien.com',
    },
  ])
  .setAdUnits('video-showcase', [
    {
      name: 'header',
      id: '5c7fd95344d39f0b6db85fdb',
      width: 600,
      height: 100,
      uri: 'https://email-serve.ien.com',
    },
  ])
  .setAdUnits('id-video-showcase', [
    {
      name: 'header',
      id: '601424ceae663a0e6759c81e',
      width: 600,
      height: 100,
      uri: 'https://email-serve.inddist.com',
    },
  ])
  .setAdUnits('product-showcase', [
    {
      name: 'header',
      id: '5c7fd93add5ae7033c8d046b',
      width: 600,
      height: 100,
      uri: 'https://email-serve.ien.com',
    },
  ])
  .setAdUnits('industrial-technology-today', [
    {
      name: 'header',
      id: '5c7fd8e644d39f0f19b85f7f',
      width: 600,
      height: 100,
      uri: 'https://email-serve.ien.com',
    },
  ])
  .setAdUnits('industrial-software-technology', [
    {
      name: 'header',
      id: '5c7fd961dd5ae7189f8d0487',
      width: 600,
      height: 100,
      uri: 'https://email-serve.ien.com',
    },
  ])
  .setAdUnits('industrial-management-today', [
    {
      name: 'header',
      id: '5c7fd8fbdd5ae787f98d042a',
      width: 600,
      height: 100,
      uri: 'https://email-serve.ien.com',
    },
  ])
  .setAdUnits('food-beverage-insider', [
    {
      name: 'header',
      id: '5c7fd97144d39f8d00b85ff7',
      width: 600,
      height: 100,
      uri: 'https://email-serve.ien.com',
    },
  ])
  .setAdUnits('finishing-world', [
    {
      name: 'header',
      id: '5c7fd918dd5ae73bdd8d044f',
      width: 600,
      height: 100,
      uri: 'https://email-serve.ien.com',
    },
  ])
  .setAdUnits('industrial-technology-today', [
    {
      name: 'header',
      id: '5c7fd8e644d39f0f19b85f7f',
      width: 600,
      height: 100,
      uri: 'https://email-serve.ien.com',
    },
  ])
  .setAdUnits('engineering-news-today', [
    {
      name: 'header',
      id: '5c7fd92944d39fefc6b85fbf',
      width: 600,
      height: 100,
      uri: 'https://email-serve.ien.com',
    },
  ])
  .setAdUnits('ien-update', [
    {
      name: 'header',
      id: '5c7fd8c7dd5ae749ea8d040e',
      width: 600,
      height: 100,
      uri: 'https://email-serve.ien.com',
    },
  ])

  .setAdUnits('mbt-today', [
    {
      name: 'header',
      id: '5ddd58ac55da0684a3436b05',
      width: 600,
      height: 100,
      uri: 'https://email-serve.mbtmag.com',
    },
  ])
  .setAdUnits('food-video-showcase', [
    {
      name: 'header',
      id: '61f2bba20d2f1a7717ee7767',
      width: 600,
      height: 100,
      uri: 'https://email-serve.ien.com',
    },
  ])
  .setAdUnits('impo-video-showcase', [
    {
      name: 'header',
      id: '61f2bbca5d6c0a90928a1627',
      width: 600,
      height: 100,
      uri: 'https://email-serve.ien.com',
    },
  ])
  .setAdUnits('today-medical-design-development', [
    {
      name: 'header',
      id: '622119fa5d6c0a35b18a5cad',
      width: 600,
      height: 100,
    },
  ])
  .setAdUnits('imts-weekly', [
    {
      name: 'header',
      id: '62b4bcf2c6f3de4ac5a43913',
      width: 600,
      height: 100,
    },
  ])
  .setAdUnits('design-development-weekly-comp', [
    {
      name: 'header',
      id: '6332f0b9dbe278486fcaabcb',
      width: 600,
      height: 100,
      uri: 'https://email-serve.designdevelopmenttoday.com',
    },
  ])
  .setAdUnits('manufacturing-weekly-comp', [
    {
      name: 'header',
      id: '6332f4bde0b1e864c422d508',
      width: 600,
      height: 100,
      uri: 'https://email-serve.manufacturing.net',
    },
  ])
  .setAdUnits('mdd-video-showcase', [
    {
      name: 'header',
      id: '638a12eae0b1e83f132374fc',
      width: 600,
      height: 100,
    },
  ])
  .setAdUnits('id-ma-monthly', [
    {
      name: 'header',
      id: '63c01ab4d852a643db05f313',
      width: 600,
      height: 100,
    },
  ])
  .setAdUnits('fm-weekly-tim-podcast', [
    {
      name: 'header',
      id: '64b56133622c15b6efab69d4',
      width: 600,
      height: 100,
      uri: 'https://email-serve.foodmanufacturing.com',
    },
  ])
  .setAdUnits('ien-weekly-tim-podcast', [
    {
      name: 'header',
      id: '64b5618d374d32530b17bf4b',
      width: 600,
      height: 100,
      uri: 'https://email-serve.ien.com',
    },
  ])
  .setAdUnits('design-development-weekly-tim-podcast', [
    {
      name: 'header',
      id: '64b561d7374d32299917bf8b',
      width: 600,
      height: 100,
      uri: 'https://email-serve.designdevelopmenttoday.com',
    },
  ]);

module.exports = config;
