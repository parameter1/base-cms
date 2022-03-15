const { get } = require('@parameter1/base-cms-object-path');

module.exports = ({
  promoCode,
  omedaPromoCodeCookieName = 'omeda_promo_code',
  omedaPromoCodeDefault,
  cookies = {},
} = {}) => promoCode || get(cookies, omedaPromoCodeCookieName) || omedaPromoCodeDefault;
