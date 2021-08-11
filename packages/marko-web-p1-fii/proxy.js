const proxy = require('express-http-proxy');

module.exports = (app, {
  url = process.env.P1_FII_API_URL || 'https://fii.parameter1.com/',
  orgZone,
  headers,
}) => {
  const mountPoint = '/__p1fii';
  const opts = {
    proxyReqPathResolver: ({ originalUrl }) => originalUrl.replace(mountPoint, ''),
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
