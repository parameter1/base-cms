const EmailXConfiguration = require('@parameter1/base-cms-marko-newsletters-email-x/config');

const config = new EmailXConfiguration(process.env.EMAILX_SERVE_URI || 'https://delivery.mindfulcms.com/parameter1/default/compat/email-banner');

config
  .setAdUnits('daily', [
    {
      name: 'lb-1',
      id: '5c536345fbfe2017ebb90b80',
      width: 600,
      height: 100,
    },
    {
      name: 'mr-1',
      id: '5c53635a5bae97773b9e9684',
      width: 300,
      height: 250,
    },
  ]);

module.exports = config;
