const EmailXConfiguration = require('@parameter1/base-cms-marko-newsletters-email-x/config');

const config = new EmailXConfiguration(process.env.EMAILX_SERVE_URI || 'https://roguemonkeymedia.serve.email-x.parameter1.com');

// config
//   .setAdUnits('fm-today', [
//     {
//       name: 'header',
//       id: '5ddd5531c044ef4d6c9d4055',
//       width: 600,
//       height: 100,
//       uri: 'https://email-serve.foodmanufacturing.com',
//     },
//   ]);

module.exports = config;
