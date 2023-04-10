const IdentityXConfiguration = require('@parameter1/base-cms-marko-web-identity-x/config');

const { log } = console;

module.exports = new IdentityXConfiguration({
  appId: process.env.IDENTITYX_APP_ID,
  apiToken: process.env.IDENTITYX_API_TOKEN,
  requiredServerFields: ['givenName', 'familyName', 'countryCode'],
  requiredClientFields: ['regionCode', 'countryCode'],
  requiredCreateFields: ['givenName', 'familyName'],
  booleanQuestionsLabel: 'Choose your subscriptions:',
  enableChangeEmail: true,
  defaultFieldLabels: {
    phoneNumber: 'Mobile Phone',
    organization: 'Company Name',
  },
  hiddenFields: [],
  onHookError: (e) => {
    log('IDENTITY-X HOOK ERROR!', e);
  },
});
