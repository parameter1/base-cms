module.exports = (type) => {
  const tenantKey = process.env.TENANT_KEY.replace('_', '-');
  return `base.${tenantKey}.${type}`;
};
