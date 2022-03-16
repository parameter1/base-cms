/**
 * Sets the `omeda_promo_code` cookie to identify the customer's promotion source if the
 * `omeda_promo_code` URL parameter is present.
 * '
 * @param {String} omedaPromoCodeCookieName The name of the cookie to interact with
 */
module.exports = ({
  omedaPromoCodeCookieName = 'omeda_promo_code',
} = {}) => (req, res, next) => {
  const { [omedaPromoCodeCookieName]: promoCode } = req.query;
  const incomingPromoCode = `${promoCode || ''}`.trim().toUpperCase();

  // Set the promo source cookie
  if (incomingPromoCode) {
    const options = { maxAge: 60 * 60 * 24 * 365, httpOnly: false };
    res.cookie(omedaPromoCodeCookieName, incomingPromoCode, options);
  }

  next();
};
