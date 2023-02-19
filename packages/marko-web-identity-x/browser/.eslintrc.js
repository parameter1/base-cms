const root = require('../../../eslintrc.browser');

module.exports = {
  ...root,
  rules: {
    ...root.rules,
    'vue/no-v-html': 'off',
    // @todo this should NOT stay on, only added because some form fields were handled wrong
    'vue/no-mutating-props': 'off',
  },
};
