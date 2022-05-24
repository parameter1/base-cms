const createError = require('http-errors');
const fetch = require('node-fetch');

module.exports = async ({
  token,
  secretKey,
  actions,
  minimumScore,
}) => {
  const score = minimumScore || 0.5;
  const submitActions = actions || [];

  if (!token) throw createError(400, 'A verification token is required.');
  const params = new URLSearchParams();
  params.append('response', token);
  params.append('secret', secretKey);
  const recaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', { method: 'post', mode: 'no-cors', body: params });
  const recaptchaData = await recaptchaRes.json();
  if (!recaptchaData.success || !submitActions.includes(recaptchaData.action) || recaptchaData.score < score) throw createError(400, 'Unable to validate request because reCAPTCHA failed.');
};
