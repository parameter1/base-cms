module.exports = {
  extends: 'airbnb-base',
  plugins: [
    'import'
  ],
  rules: {
    'import/extensions': ['error', 'ignorePackages', { js: 'never', marko: 'never', json: 'always' }],
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
  },
};
