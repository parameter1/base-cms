const COOKIE_NAME = 'oly_enc_id';

const clean = (value) => {
  if (!value || value === 'null') return null;
  const cleaned = value.replace(/"/g, '').trim().toUpperCase();
  return /^[A-Z0-9]{15}$/.test(cleaned) ? cleaned : null;
};

const parseFrom = (req) => {
  const value = req.cookies[COOKIE_NAME];
  return clean(value);
};

const clearFrom = (res) => {
  res.clearCookie(COOKIE_NAME);
};

const setTo = (res, value) => {
  const cleaned = clean(value);
  if (!cleaned) return false;
  res.cookie(COOKIE_NAME, `"${cleaned}"`, {
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
  });
  return true;
};

module.exports = {
  clean,
  clearFrom,
  parseFrom,
  setTo,
};
