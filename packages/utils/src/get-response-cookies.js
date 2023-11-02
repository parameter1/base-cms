const { error } = console;

/**
 * Returns an object containing the cookies set in the response.
 *
 * @param {import('express').Request} res
 * @returns {Object} kv pairs
 */
module.exports = (res) => {
  try {
    const sc = res.get('set-cookie');
    return (typeof sc === 'string' ? [sc] : sc || []).reduce((o, c) => {
      const [r] = `${c}`.split(';');
      const [k, v] = `${r}`.split('=');
      return { ...o, [k]: v };
    }, {});
  } catch (e) {
    error('Unable to parse response cookies', e);
  }
  return {};
};
