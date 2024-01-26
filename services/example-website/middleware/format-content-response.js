const { get, getAsObject } = require('@parameter1/base-cms-object-path');

const cookieNamePrefix = '__idx_form';
const days = 14;

const formatContentResponse = ({ res, content }) => {
  // Handle setting of contentIdxFormState Object
  const { surveyType, surveyId } = getAsObject(content, 'gating');
  res.locals.contentIdxFormState = {
    displayForm: false,
    formId: 'default',
  };
  if (surveyType === 'idx') {
    const cookieName = `${cookieNamePrefix}_${surveyId}_${content.id}`;
    const maxAge = days * 24 * 60 * 60 * 1000;
    const cookie = { name: cookieName, maxAge };
    res.locals.displayForm = true;
    res.locals.contentIdxFormState.formId = surveyId;
    res.locals.contentIdxFormState.cookie = cookie;
  }

  if (res.locals.newsletterState) {
    const {
      initiallyExpanded,
      hasCookie,
      fromEmail,
      disabled,
      cookie,
    } = res.locals.newsletterState;

    if (get(content, 'userRegistration.isCurrentlyRequired') === true || surveyType === 'idx') {
      res.locals.newsletterState.initiallyExpanded = false;
    } else if (!initiallyExpanded && !hasCookie && !disabled && !fromEmail) {
      res.cookie(cookie.name, true, { maxAge: cookie.maxAge });
      res.locals.newsletterState.initiallyExpanded = true;
    }
  }
};

module.exports = {
  formatContentResponse,
};
