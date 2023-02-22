module.exports = {
  extends: [
    'airbnb-base',
    'plugin:vue/recommended',
    'plugin:compat/recommended',
  ],
  plugins: [
    'compat',
  ],
  env: {
    browser: true,
  },
  rules: {
    'vue/max-attributes-per-line': ['error', {
      singleline: {
        max: 3,
      },
      multiline: {
        max: 1,
      },
    }],
    'vue/multi-word-component-names': 'off',
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
  },
};
