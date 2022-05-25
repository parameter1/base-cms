const identityX = require('./identity-x');
const omeda = require('./omeda');
const newsletter = require('./newsletter');

module.exports = {
  identityX,
  omeda,
  newsletter,
  inquiry: {
    enabled: true,
    directSend: false,
    sendTo: 'requestmoreinfo@acbusinessmedia.com',
    sendFrom: 'NO REPLAY <noreply@parameter1.com>',
    logo: '',
    bgColor: '#000',
  },
};
