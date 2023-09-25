module.exports = (value, type) => {
  if (!value) return null;
  const trimmed = `${value.replace(/^"/, '').replace(/"$/, '')}`.trim();
  if (type === 'anon') {
    return /^[a-z0-9-]{36}$/i.test(trimmed) ? trimmed : null;
  }
  if (type === 'enc') {
    return /^[a-z0-9]{15}$/i.test(trimmed) ? trimmed : null;
  }
  return null;
};
