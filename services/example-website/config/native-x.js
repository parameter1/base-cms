const NativeXConfiguration = require('@parameter1/base-cms-marko-web-native-x/config');

const config = new NativeXConfiguration('https://example.native-x.parameter1.com', { enabled: true });

config.setPlacement({ alias: 'default', name: 'default', id: '5f4ff650940a650001095e1a' });

module.exports = config;
