/* eslint-disable no-underscore-dangle */
process.env.MARKO_DEBUG = false;
require('marko');
const { readFileSync } = require('fs');
const { emitWarning } = require('process');
const compileSync = require('@parameter1/base-cms-marko-compiler/compile/one-sync');

const encoding = 'utf8';

function emitCompileWarning() {
  if (!emitCompileWarning.warned) {
    emitCompileWarning.warned = true;
    emitWarning('One or more Marko templates were compiled on-the-fly. All templates should be compiled before running the server.');
  }
}

require.extensions['.marko'] = (module, filename) => {
  const target = `${filename}.js`;
  if (process.env.MARKO_REQUIRE_PREBUILT_TEMPLATES) {
    try {
      const content = readFileSync(target, { encoding });
      module._compile(content, target);
    } catch (e) {
      if (e.code === 'ENOENT') {
        throw new Error(`Marko is configured to require prebuilt templates but no compiled template was found for ${filename}`);
      }
      throw e;
    }
  } else {
    emitCompileWarning();
    compileSync(filename);
    module._compile(readFileSync(target, { encoding }), target);
  }
};
