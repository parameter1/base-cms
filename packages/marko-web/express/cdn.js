const { cleanPath } = require('@parameter1/base-cms-utils');

module.exports = ({ enabled = false, origin, siteVersion } = {}) => (req, res, next) => {
  const { config, tenantKey } = req.app.locals;
  res.locals.cdn = {
    enabled: enabled || ['true', '1'].includes(req.query.cdn),
    origin,
    url: `${cleanPath(origin)}/web-assets/${tenantKey}/${config.website('id')}/v${siteVersion}`,
  };
  next();
};
