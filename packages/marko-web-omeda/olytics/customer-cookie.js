const { getDomain } = require('tldjs');

const COOKIE_NAME = 'oly_enc_id';

const getDotDomainFrom = req => `.${getDomain(req.hostname)}`;

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
  const dotDomain = getDotDomainFrom(res.req);
  res.clearCookie(COOKIE_NAME);
  res.clearCookie(COOKIE_NAME, { domain: dotDomain });
};

const setTo = (res, value) => {
  const cleaned = clean(value);
  if (!cleaned) return false;
  const options = {
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
  };
  const dotDomain = getDotDomainFrom(res.req);
  res.cookie(COOKIE_NAME, cleaned, options);
  res.cookie(COOKIE_NAME, cleaned, { ...options, domain: dotDomain });
  return true;
};

module.exports = {
  clean,
  clearFrom,
  parseFrom,
  setTo,
};
