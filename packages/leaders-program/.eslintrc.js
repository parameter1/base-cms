const path = require('path');

module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/recommended',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/max-attributes-per-line': ['error', {
      singleline: {
        max: 3,
      },
      multiline: {
        max: 1,
      },
    }],
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    configFile: path.resolve(__dirname, './babel.config.js'),
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
  },
};
