const { getDomain } = require('tldjs');

const COOKIE_NAME = 'identity-x-source';
const DEFAULT_VALUE = 'source-unknown';

const getDotDomainFrom = req => `.${getDomain(req.hostname)}`;

const clean = (value) => {
  if (!value || value === 'null') return DEFAULT_VALUE;
  const cleaned = value.trim();
  return /^[a-zA-Z0-9_-]/.test(cleaned) ? cleaned : null;
};

const parseFrom = (req) => {
  const value = req.cookies[COOKIE_NAME] || DEFAULT_VALUE;
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
