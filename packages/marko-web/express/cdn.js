const { cleanPath } = require('@parameter1/base-cms-utils');

module.exports = ({ enabled = false, origin, siteVersion } = {}) => (req, res, next) => {
  const { config, tenantKey } = req.app.locals;
  const url = `${cleanPath(origin)}/web-assets/${tenantKey}/${config.website('id')}/v${siteVersion}`;
  const isEnabled = enabled || ['true', '1'].includes(req.query.cdn);

  const href = (prefix, path) => {
    const cleaned = cleanPath(path);
    return isEnabled ? `${url}/${prefix}/${cleaned}` : `/${prefix}/${cleaned}`;
  };

  res.locals.cdn = {
    enabled: isEnabled,
    origin,
    url,
    dist: (path) => href('dist', path),
    public: (path) => href('public', path),
  };
  next();
};
