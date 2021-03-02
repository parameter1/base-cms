module.exports = (params = {}) => {
  const keys = ['action', 'category', 'label', 'payload'];
  return keys.reduce((o, key) => {
    const value = key === 'payload' ? JSON.stringify(params[key]) : params[key];
    if (!value) return o;
    return { ...o, [`data-leaders-${key}`]: value };
  }, {});
};
