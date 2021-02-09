const { TENANT_KEY } = process.env;

module.exports = (type) => {
  const tenantKey = TENANT_KEY.replace('_', '-');
  return `base.${tenantKey}.${type}`;
};
