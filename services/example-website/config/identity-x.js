const IdentityXConfiguration = require('@parameter1/base-cms-marko-web-identity-x/config');
const download = require('./identity-x/download');
const formDefault = require('./identity-x/default');

const { log } = console;

log('env: ', process.env)

module.exports = new IdentityXConfiguration({
  appId: process.env.IDENTITYX_APP_ID,
  ...(process.env.IDENTITYX_CONTEXT === 'parameter1.io' ? {
    // Parameter1.io
    appContextId: '64483ba86ffc39e3e8cf13c4',
    activeCustomFieldIds: [
      '618a8a62934f8400ad4beb8f', // Favorite food
      '626fe8854e597205b368a50f', // Favorite color
      '62c4883255955d8d69e1b4ca', // DMN magazine
    ],
  } : {
    // Parameter1.dev
    appContextId: '5d1b86070ce467bff670a052',
    activeCustomFieldIds: [
      '628e9333f8dbf1d5cdda43d2', //
      '6272f0046f7301b6afa14956', //
    ],
  }),
  // custom form field definitions
  forms: {
    default: formDefault,
    download,
  },
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
  progressiveDelay: 0.1, // hours
  progressiveQuestions: [
    {
      id: 'givenName',
    },
    // {
    //   id: 'familyName',
    // },
    // {
    //   id: 'postalCode',
    // },
    // {
    //   id: 'street',
    // },
    // {
    //   id: 'countryCode',
    // },

    {
      id: '628e9333f8dbf1d5cdda43d2',
    },
    {
      id: '6272f0046f7301b6afa14956',
    },

  ],
  hiddenFields: [],
  onHookError: (e) => {
    log('IDENTITY-X HOOK ERROR!', e);
  },
  gtmUserFields: {
    weather_preference: '628e98dc2da307ff2ef6a8b0',
    games: '618ab74dcd3e2f0147386c42',
    food: '618a8a62934f8400ad4beb8f',
  },
});
