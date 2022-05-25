const { asyncRoute } = require('@parameter1/base-cms-utils');
const { getAsArray } = require('@parameter1/base-cms-object-path');
const { validateToken } = require('@parameter1/base-cms-marko-web-recaptcha');
const { content: contentLoader } = require('@parameter1/base-cms-web-common/page-loaders');
const buildMarkoGlobal = require('@parameter1/base-cms-marko-web/utils/build-marko-global');
const send = require('../send-mail');
const { notificationBuilder, confirmationBuilder } = require('../template-builders');
const storeInquiry = require('../utils/store-inquiry');
const { RECAPTCHA_V3_SECRET_KEY } = require('../env');

module.exports = ({ queryFragment, notification, confirmation }) => asyncRoute(async (req, res) => {
  const { site } = res.app.locals;
  const {
    sendBcc: bcc,
    sendFrom: from,
    sendTo: to,
    directSend,
    notificationSubject,
    confirmationSubject,
  } = site.getAsObject('inquiry');
  const $global = buildMarkoGlobal(res);
  const { apollo, body } = req;
  const { token, ...payload } = body;
  const content = await contentLoader(apollo, { id: req.params.id, queryFragment });
  const emails = getAsArray(content, 'inquiryEmails');
  const addresses = {
    to: directSend && emails.length ? emails : to,
    cc: directSend && emails.length ? to : undefined,
    bcc,
    from,
  };

  const exception = (message, code = 400) => {
    const err = new Error(message);
    err.statusCode = code;
    return err;
  };

  if (!payload || !payload.email) {
    throw exception('Invalid form submission');
  }

  await validateToken({
    token,
    secretKey: RECAPTCHA_V3_SECRET_KEY,
    actions: ['inquirySubmission'],
  });

  await Promise.all([
    // Store the submission
    storeInquiry({
      apollo,
      contentId: content.id,
      payload,
      addresses,
    }),
    // Notify the contacts of the submission
    send(notificationBuilder({
      template: notification,
      $global,
      content,
      subject: notificationSubject,
      payload,
      addresses,
    })),
    // Notify the user their submission was received
    req.body.confirmationEmail ? send(confirmationBuilder({
      template: confirmation,
      $global,
      content,
      subject: confirmationSubject,
      email: req.body.confirmationEmail,
      from,
      bcc,
    })) : Promise.resolve(null),
  ]);
  res.json({ ok: true });
});
