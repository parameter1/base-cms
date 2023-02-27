const path = require('path');
const { readFile, writeFile, rename } = require('fs').promises;
const { grey } = require('chalk');
const { getProfileMS } = require('@parameter1/base-cms-utils');
const runCompile = require('./run');
const createLogger = require('../utils/create-logger');
const stat = require('../utils/stat');

const encoding = 'utf8';

const needsCompilation = async ({ templateFile, compiledFile, force }) => {
  if (force) return true;
  const compiledStats = await stat.async(compiledFile, { throwOnNotFound: false });
  if (!compiledStats) return true;
  const templateStats = await stat.async(templateFile);
  return compiledStats.mtime < templateStats.mtime;
};

const compile = async ({ templateFile, compilerOptions } = {}) => {
  const templateSrc = await readFile(templateFile, { encoding });
  return runCompile({ templateSrc, templateFile, compilerOptions });
};

module.exports = async (templateFile, {
  force = false,
  debug = false,
  tempFile = false,
  compilerOptions,
} = {}) => {
  let start;
  const log = createLogger({ debug });
  if (debug) start = process.hrtime();
  if (!path.isAbsolute(templateFile)) throw new Error('Marko template files must be absolute.');
  const compiledFile = `${templateFile}.js`;

  const shouldCompile = await needsCompilation({ templateFile, compiledFile, force });
  if (!shouldCompile) return;

  const compiled = await compile({ templateFile, compilerOptions });
  if (!compiled) return;
  if (tempFile) {
    const tempFilePath = path.join(path.dirname(templateFile), `.${process.pid}.${Date.now()}.${path.basename(compiledFile)}`);
    await writeFile(tempFilePath, compiled.code, { encoding });
    await rename(tempFilePath, compiledFile);
  } else {
    await writeFile(compiledFile, compiled.code, { encoding });
  }
  if (debug) log(`compiled marko template ${grey(templateFile)} in ${getProfileMS(start)}ms`);
};
