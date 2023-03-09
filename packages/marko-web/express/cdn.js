const { cleanPath } = require('@parameter1/base-cms-utils');

module.exports = ({ enabled = false, origin, siteVersion } = {}) => (req, res, next) => {
  const { config, tenantKey } = req.app.locals;
  const url = `${cleanPath(origin)}/web-assets/${tenantKey}/${config.website('id')}/v${siteVersion}`;

  const key = '__cdn';
  const values = new Set(['true', '1']);
  let isEnabled = enabled;
  if (values.has(req.query[key])) isEnabled = true;
  if (values.has(req.cookies[key])) isEnabled = true;

  res.locals.cdn = {
    enabled: isEnabled,
    origin,
    url,
    dist: (path) => {
      const cleaned = `dist/${cleanPath(path)}`;
      return isEnabled ? `${url}/${cleaned}` : `/${cleaned}`;
    },
    public: (path) => {
      const cleaned = cleanPath(path);
      return isEnabled ? `${url}/public/${cleaned}` : `/${cleaned}`;
    },
  };
  next();
};
