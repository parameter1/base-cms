const emailX = require('./email-x');
const nativeX = require('./native-x');

const config = {
  emailX,
  nativeX,

  // ENL cfgs
  daily: {
    name: 'Sandbox Daily',
    primaryColor: '#1f4391',
    logo: { src: '/files/base/p1/sandbox/image/static/sandbox-logo.png?&auto=format,compress' },
  },
};

module.exports = config;
