const { set } = require('@parameter1/base-cms-object-path');
const proxy = require('express-http-proxy');
const getOmedaId = require('./utils/get-omeda-id');

module.exports = (app, {
  url = process.env.P1_FII_API_URL || 'https://fii.parameter1.com/',
  orgZone,
  headers,
}) => {
  const mountPoint = '/__p1fii';
  const opts = {
    proxyReqPathResolver: ({ originalUrl }) => originalUrl.replace(mountPoint, ''),
    proxyReqBodyDecorator: (body, req) => {
      const encryptedCustomerId = getOmedaId(req);
      const obj = JSON.parse(body.toString());
      set(obj, 'params.encryptedCustomerId', encryptedCustomerId || undefined);
      return Buffer.from(JSON.stringify(obj), 'utf-8');
    },
    proxyReqOptDecorator: (reqOpts, req) => {
      const proxyHeaders = {
        ...reqOpts.headers,
        ...headers,
        'x-org-zone': orgZone,
        'x-forwarded-proto': req.protocol,
      };
      return { ...reqOpts, headers: proxyHeaders };
    },
  };
  app.use(mountPoint, proxy(url, opts));
};
