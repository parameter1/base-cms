process.env.MARKO_DEBUG = false;
const compiler = require('marko/compiler');

module.exports = ({
  templateSrc,
  templateFile,
  compilerOptions,
} = {}) => compiler.compile(templateSrc, templateFile, {
  ...compilerOptions,
  requireTemplates: true,
  sourceOnly: false,
});
