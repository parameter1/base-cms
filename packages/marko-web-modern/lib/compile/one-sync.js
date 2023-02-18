const path = require('path');
const { readFileSync, writeFileSync, renameSync } = require('fs');
const { getProfileMS } = require('@parameter1/base-cms-marko-web-modern-utils');
const runCompile = require('./run');
const stat = require('../utils/stat');

const encoding = 'utf8';
const { log } = console;

const needsCompilation = ({ templateFile, compiledFile, force }) => {
  if (force) return true;
  const compiledStats = stat.sync(compiledFile, { throwOnNotFound: false });
  if (!compiledStats) return true;
  const templateStats = stat.sync(templateFile);
  return compiledStats.mtime < templateStats.mtime;
};

const compile = ({ templateFile, compilerOptions } = {}) => {
  const templateSrc = readFileSync(templateFile, { encoding });
  return runCompile({ templateSrc, templateFile, compilerOptions });
};

module.exports = (templateFile, {
  force = false,
  debug = false,
  tempFile = false,
  compilerOptions,
} = {}) => {
  let start;
  if (debug) start = process.hrtime();
  if (!path.isAbsolute(templateFile)) throw new Error('Marko template files must be absolute.');
  const compiledFile = `${templateFile}.js`;

  const shouldCompile = needsCompilation({ templateFile, compiledFile, force });
  if (!shouldCompile) return;

  const compiled = compile({ templateFile, compilerOptions });
  if (!compiled) return;
  if (tempFile) {
    const tempFilePath = path.join(path.dirname(templateFile), `.${process.pid}.${Date.now()}.${path.basename(compiledFile)}`);
    writeFileSync(tempFilePath, compiled.code, { encoding });
    renameSync(tempFilePath, compiledFile);
  } else {
    writeFileSync(compiledFile, compiled.code, { encoding });
  }
  if (debug) log(`Compiled Marko template ${templateFile} in ${getProfileMS(start)}ms`);
};
