const { get } = require('@parameter1/base-cms-object-path');

const cookieName = 'identity-x-newsletter-modal-viewed';

module.exports = () => (req, res, next) => {
  const hasCookie = Boolean(get(req, `cookies.${cookieName}`));
  const cookieValue = get(req, `cookies.${cookieName}`);

  res.locals.newsletterModalState = { cookieName, cookieValue, hasCookie };
  next();
};
