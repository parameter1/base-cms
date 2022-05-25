const createError = require('http-errors');
const fetch = require('node-fetch');

module.exports = async ({
  token,
  secretKey = 0.5,
  actions = [],
  minimumScore,
}) => {
  if (!token) throw createError(400, 'A verification token is required.');
  if (!secretKey) throw createError(400, 'A recaptcha secretKey is required.');
  if (!actions || !actions.length) throw createError(400, 'At least one recaptcha action is required');
  const params = new URLSearchParams();
  params.append('response', token);
  params.append('secret', secretKey);
  const recaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', { method: 'post', mode: 'no-cors', body: params });
  const recaptchaData = await recaptchaRes.json();
  if (!recaptchaData.success) throw createError(400, 'Unable to validate request because reCAPTCHA failed.');
  if (!actions.includes(recaptchaData.action)) throw createError(400, 'Unable to validate request because reCAPTCHA action is not supported');
  if (recaptchaData.score < minimumScore) throw createError(400, 'Unable to validate request because reCAPTCHA score did not meet minimum requirements.');
};
