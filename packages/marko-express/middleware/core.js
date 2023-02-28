/* eslint-disable no-underscore-dangle */
process.env.MARKO_DEBUG = false;
require('marko');
const path = require('path');
const buildGlobal = require('../utils/build-global');

// eslint-disable-next-line import/no-extraneous-dependencies
const express = module.main ? module.main.require('express') : require('express');

if (!express) throw new Error('Unable to load Express.');

const patch = (response) => {
  response.marko = response.marko || async function markoResponse(template, data) {
    if (typeof template === 'string') throw new Error('res.marko does not accept a string or path as a template.');

    const res = this;
    const { req } = res;
    const $global = buildGlobal(res, data);

    const shouldPurge = ['cookies', 'query'].some((key) => {
      const { __purgecss: purge } = req[key];
      return purge && !['false', '0', 'null'].includes(purge);
    });
    if (shouldPurge) {
      const { config } = $global;
      const params = new URLSearchParams({
        // get the incoming, entry template file location
        template: template.path.replace(/\.marko\.js$/, '.marko'),
        // get the full css file
        css: path.join(config.get('rootDir'), config.styles()[0]),
      });
      // set the stand-in route name to be used by the document stylesheet rel
      $global.__purgecss = `/__purgecss?${params}`;
    }

    res.set({ 'content-type': 'text/html; charset=utf-8' });
    return template.render({ ...(data || {}), $global }, res).on('error', req.next);
  };
};

patch(express.response);
delete require.cache[__filename];

module.exports = () => {
  const app = express();
  app.once('mount', (parent) => {
    patch(parent.response);
    if (parent._router) {
      parent._router.stack.pop(); // express <= 4.x
    } else {
      parent.router.stack.pop(); // express 5.x
    }
  });
  return app;
};
