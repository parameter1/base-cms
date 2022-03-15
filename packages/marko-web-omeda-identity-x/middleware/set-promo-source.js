const clean = (value) => {
  if (!value || value === 'null') return null;
  return value.replace(/"'/g, '').trim().toUpperCase();
};

/**
 * Sets the `omeda_promo_code` cookie to identify the customer's original promotion source if the
 * `omeda_promo_code` URL parameter is present.
 * '
 * @param {String} omedaPromoCodeCookieName The name of the cookie to interact with
 */
module.exports = ({
  omedaPromoCodeCookieName = 'omeda_promo_code',
} = {}) => (req, res, next) => {
  const promoSource = clean(req.cookies[omedaPromoCodeCookieName]);

  const { [omedaPromoCodeCookieName]: promoCode } = req.query;
  const incomingPromoCode = clean(promoCode);

  // Only set the promo source cookie if it doesn't already exist
  if (!promoSource && incomingPromoCode) {
    const options = { maxAge: 60 * 60 * 24 * 365, httpOnly: false };
    res.cookie(omedaPromoCodeCookieName, `${incomingPromoCode}`, options);
  }

  next();
};
