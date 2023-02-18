/* eslint-disable no-underscore-dangle */
require('marko');
const buildGlobal = require('../build-global');

// eslint-disable-next-line import/no-extraneous-dependencies
const express = module.main ? module.main.require('express') : require('express');

if (!express) throw new Error('Unable to load Express.');

const patch = (response) => {
  response.marko = response.marko || function markoResponse(template, data) {
    if (typeof template === 'string') throw new Error('res.marko does not accept a string or path as a template.');

    const res = this;
    const { req } = res;
    res.set({ 'content-type': 'text/html; charset=utf-8' });
    const $global = buildGlobal(res, data);
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
