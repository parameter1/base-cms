require('marko');

const path = require('path');
const fs = require('fs');
const resolveFrom = require('resolve-from');
const stat = require('./fs/stat');

const { MARKO_REQUIRE_DEBUG } = process.env;
const { log: l } = console;
const log = (...args) => l('marko-node-require:', ...args);

if (MARKO_REQUIRE_DEBUG) log('debug enabled');

const fsReadOptions = { encoding: 'utf8' };
const MARKO_EXTENSIONS = Symbol('MARKO_EXTENSIONS');

function getCompileReason({ templatePath, targetFile } = {}) {
  const targetStats = stat(targetFile, { throwOnNotFound: false });
  if (!targetStats) return 'notfound';
  const templateStats = stat(templatePath);
  return targetStats.mtime < templateStats.mtime ? 'outdated' : false;
}

function compile(templatePath, markoCompiler, compOptions) {
  const compilerOptions = {
    ...markoCompiler.defaultOptions,
    ...compOptions,
  };

  let compiledSrc;
  const targetFile = `${templatePath}.js`;
  const compileReason = getCompileReason({ templatePath, targetFile });
  if (compileReason) {
    if (MARKO_REQUIRE_DEBUG) log(`${compileReason === 'outdated' ? 're' : ''}compiling ${targetFile}...`);
    const targetDir = path.dirname(templatePath);
    const templateSrc = fs.readFileSync(templatePath, fsReadOptions);
    compiledSrc = markoCompiler.compile(templateSrc, templatePath, compilerOptions);

    // Write to a temporary file and move it into place to avoid problems
    // assocatiated with multiple processes writing to the same file.
    const filename = path.basename(targetFile);
    const tempFile = path.join(targetDir, `.${process.pid}.${Date.now()}.${filename}`);
    fs.writeFileSync(tempFile, compiledSrc, fsReadOptions);
    fs.renameSync(tempFile, targetFile);
  } else {
    compiledSrc = fs.readFileSync(targetFile, fsReadOptions);
  }
  return compiledSrc;
}

(() => {
  const requireExtensions = require.extensions;

  const compilerOptions = { requireTemplates: true };

  // eslint-disable-next-line global-require
  require('marko/compiler').configure(compilerOptions);

  const extension = '.marko';
  function markoRequireExtension(module, filename) {
    // Resolve the appropriate compiler relative to the location of the
    // marko template file on disk using the "resolve-from" module.
    const dirname = path.dirname(filename);
    const markoCompilerModulePath = resolveFrom(dirname, 'marko/compiler');
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const markoCompiler = require(markoCompilerModulePath);

    // Now use the appropriate Marko compiler to compile the Marko template
    // file to JavaScript source code:
    const compiledSrc = compile(filename, markoCompiler, compilerOptions);

    // eslint-disable-next-line no-underscore-dangle
    return module._compile(compiledSrc, filename);
  }

  requireExtensions[MARKO_EXTENSIONS] = requireExtensions[MARKO_EXTENSIONS]
    || (requireExtensions[MARKO_EXTENSIONS] = []);

  requireExtensions[extension] = markoRequireExtension;
  requireExtensions[MARKO_EXTENSIONS].push(extension);
})();
