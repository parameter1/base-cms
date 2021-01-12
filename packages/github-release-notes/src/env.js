const {
  cleanEnv,
  validators,
} = require('@parameter1/base-cms-env');

const { nonemptystr } = validators;

module.exports = cleanEnv(process.env, {
  GITHUB_PERSONAL_ACCESS_TOKEN: nonemptystr({ desc: 'A GitHub personal access token.' }),
});
