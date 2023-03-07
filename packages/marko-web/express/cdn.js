const { cleanPath } = require('@parameter1/base-cms-utils');

module.exports = ({ enabled = false, siteVersion } = {}) => (req, res, next) => {
  const { config, tenantKey } = req.app.locals;
  const origin = process.env.ASSET_CDN_ORIGIN || 'https://cdn.parameter1.com';
  res.locals.cdn = {
    enabled,
    origin,
    url: `${cleanPath(origin)}/web-assets/${tenantKey}/${config.website('id')}/v${siteVersion}`,
  };
  next();
};
