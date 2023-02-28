const { PurgeCSS } = require('purgecss');
const { Router } = require('express');
const { noCache } = require('helmet');
const { readFile } = require('fs').promises;
const { asyncRoute } = require('@parameter1/base-cms-utils');

module.exports = () => {
  const purger = Router();
  purger.get('/__purgecss', noCache(), asyncRoute(async (req, res) => {
    res.setHeader('content-type', 'text/css');
    const { query } = req;

    const css = await readFile(query.css, 'utf8');
    console.log('main css length', css.length);

    /** @type {NodeModule} */
    let template = require.cache[query.template];
    if (!template) {
      require(query.template); // eslint-disable-line
      template = require.cache[template];
    }
    if (!template) return res.send(css);

    const files = { all: new Set(), marko: new Set() };
    /**
     *
     * @param {NodeModule} mod
     */
    const walk = (mod) => {
      const { filename } = mod;
      if (/\/node_modules\/@parameter1\/base-cms-/.test(filename)) {
        files.all.add(filename);
      } else if (/\/node_modules\//.test(filename)) {
        return;
      }
      files.all.add(filename);
      if (/\.marko$/.test(filename)) files.marko.add(filename);
      if (mod.children.length) {
        mod.children.forEach((child) => {
          if (files.all.has(child.filename)) return;
          walk(child);
        });
      }
    };
    walk(template);
    console.log('found', files.marko.size, 'included marko files');
    console.log([...files.marko, '**/*.vue', '../../package/**/*.vue']);

    const [{ css: purged }] = await new PurgeCSS().purge({
      css: [{ raw: css }],
      // doesn't find ssr?
      content: [...files.marko, '**/*.vue', '../../packages/**/*.vue'],
      // content: ['**/*.marko', '../../packages/**/*.marko', '**/*.vue', '../../packages/**/*.vue'],
      safelist: {
        standard: [/--/, /__/],
      },
    });

    console.log('purged css length', purged.length);
    res.send(purged);
  }));
  return purger;
};
