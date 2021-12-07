const defaultValue = require('@parameter1/base-cms-marko-core/utils/default-value');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const { SENDGRID_API_KEY, RECAPTCHA_SECRET_KEY } = require('./env');
const emailTemplate = require('./email');

const { error } = console;

sgMail.setApiKey(SENDGRID_API_KEY);

const exception = (message, code = 400) => {
  const err = new Error(message);
  err.statusCode = code;
  return err;
};

const send = async (res, domain, payload) => {
  const config = res.app.locals.site.getAsObject(`contactUs.${payload.configName}`);
  const subject = defaultValue(config.subject, 'A new contact submission was received.');
  const to = defaultValue(config.to, 'support@parameter1.com');
  const input = {
    $global: res.app.locals,
    domain,
    subject,
    to,
    ...payload,
  };
  const html = emailTemplate.renderToString(input);
  return sgMail.send({
    subject,
    from: 'Base CMS <noreply@base-cms.io>',
    to,
    html,
    ...config.cc && { cc: config.cc },
    ...config.bcc && { bcc: config.bcc },
  });
};

const validateRecaptcha = async ({ token: response }) => {
  const params = new URLSearchParams();
  params.append('response', response);
  params.append('secret', RECAPTCHA_SECRET_KEY);
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', { method: 'post', body: params });
  const json = await res.json();
  if (!json.success) {
    error('reCAPTCHA failed!', json, { secret: RECAPTCHA_SECRET_KEY, response });
    throw exception('Unable to validate your request');
  }
  return true;
};

const validatePayload = (payload = {}) => ['name', 'phone', 'email', 'comments'].every(k => payload[k]);

module.exports = (app, siteConfig) => {
  app.post('/__contact-us', bodyParser.json(), asyncRoute(async (req, res) => {
    const payload = req.body;

    if (!await validateRecaptcha(payload)) throw exception('Unable to validate recaptcha');
    if (!validatePayload(payload)) throw exception('A required parameter was not sent');

    try {
      await send(res, req.hostname, payload, siteConfig);
      res.status(201).send();
    } catch (e) {
      error(e);
      throw exception(e);
    }
  }));
};
