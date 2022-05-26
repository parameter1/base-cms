const defaultValue = require('@parameter1/base-cms-marko-core/utils/default-value');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const { validateToken } = require('@parameter1/base-cms-marko-web-recaptcha');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const { SENDGRID_API_KEY, RECAPTCHA_V3_SECRET_KEY } = require('./env');
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
  const from = defaultValue(config.from, 'Base CMS <noreply@parameter1.com>');
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
    from,
    to,
    html,
    ...(payload.name && payload.email && { replyTo: `${payload.name} <${payload.email}>` }),
    ...config.cc && { cc: config.cc },
    ...config.bcc && { bcc: config.bcc },
  });
};


const validatePayload = (payload = {}) => ['name', 'phone', 'email', 'comments'].every(k => payload[k]);

module.exports = (app, siteConfig) => {
  app.post('/__contact-us', bodyParser.json(), asyncRoute(async (req, res) => {
    const payload = req.body;

    await validateToken({ token: payload.token, secretKey: RECAPTCHA_V3_SECRET_KEY, actions: ['contactUsSubmit'] });
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
