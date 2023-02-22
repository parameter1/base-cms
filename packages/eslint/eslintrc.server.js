module.exports = {
  extends: 'airbnb-base',
  plugins: [
    'import',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.marko'],
      },
    },
  },
  rules: {
    'import/extensions': ['error', 'ignorePackages', { js: 'never', marko: 'never', json: 'always' }],
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
  },
};
