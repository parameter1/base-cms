const PREFIX = 'data-p1';

module.exports = (params = {}) => {
  const keys = ['action', 'category', 'label', 'entity', 'context', 'props'];
  return keys.reduce((o, key) => {
    let value = key === 'props' ? JSON.stringify(params[key]) : params[key];
    if (key === 'action' && !value) value = 'Click'; // assume click when not set
    if (!value) return o;
    return { ...o, [`${PREFIX}-${key}`]: value };
  }, {});
};
