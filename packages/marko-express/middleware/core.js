/* eslint-disable no-underscore-dangle */
process.env.MARKO_DEBUG = false;
require('marko');
const buildGlobal = require('../utils/build-global');
const appendRouteInfo = require('../utils/append-route-info');
const setRouteKind = require('../utils/set-route-kind');

// eslint-disable-next-line import/no-extraneous-dependencies
const express = module.main ? module.main.require('express') : require('express');

if (!express) throw new Error('Unable to load Express.');

const patch = (response) => {
  response.marko = response.marko || function markoResponse(template, data) {
    if (typeof template === 'string') throw new Error('res.marko does not accept a string or path as a template.');

    const res = this;
    const { req } = res;
    appendRouteInfo(res, [
      { key: 'template', value: template.path.replace(/\.marko\.js$/, '.marko') },
    ]);

    if (req.path === '/') {
      // homepage
      setRouteKind(res, { kind: 'home', type: '' });
    }
    if (!res.locals.route.kind) {
      /** @type {string[]} */
      const parts = req.path.split('/').filter((v) => v);
      const kind = parts.shift();
      // generically set all other route kinds based on path when no info has been set.
      if (kind) setRouteKind(res, { kind, type: parts.join('/') });
    }

    const $global = buildGlobal(res, data);

    const { route } = res.locals;
    if (route) res.set({ 'x-route-kind': route.kind, 'x-route-type': `${route.type}` });
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
