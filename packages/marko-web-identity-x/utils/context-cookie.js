const cookie = require('cookie');

const COOKIE_NAME = '__idx_ctx';
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 365 * 2;

const setTo = (res, context) => {
  res.cookie(COOKIE_NAME, JSON.stringify(context), { maxAge: COOKIE_MAX_AGE, httpOnly: false });
};

const getFrom = (req) => {
  try {
    const cookies = cookie.parse(req.get('cookie') || '');
    const { [COOKIE_NAME]: value } = cookies;
    return value;
  } catch (e) {
    // @todo log this error.
    return undefined;
  }
};

const removeFrom = (res) => {
  res.clearCookie(COOKIE_NAME);
};

module.exports = {
  exists: (req) => Boolean(getFrom(req)),
  setTo,
  getFrom,
  removeFrom,
};
