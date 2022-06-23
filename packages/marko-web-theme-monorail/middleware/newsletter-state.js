const { get } = require('@parameter1/base-cms-object-path');

const cookieName = 'enlPrompted';

module.exports = () => (req, res, next) => {
  const hasCookie = Boolean(get(req, `cookies.${cookieName}`));
  const utmMedium = get(req, 'query.utm_medium');
  const olyEncId = get(req, 'query.oly_enc_id');
  const fromEmail = utmMedium === 'email' || olyEncId || false;

  if (!hasCookie) {
    // Expire in 14 days (2yr if already signed up)
    const days = fromEmail ? 365 * 2 : 14;
    const maxAge = days * 24 * 60 * 60 * 1000;
    res.cookie(cookieName, true, { maxAge });
  }

  res.locals.newsletterState = { hasCookie, fromEmail };
  next();
};
