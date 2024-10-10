const { get, getAsObject } = require('@parameter1/base-cms-object-path');

const cookieNamePrefix = '__idx_form';
const days = 1;

const updateContentIdxFormState = ({ res, content }) => {
  // Handle setting of contentIdxFormState Object
  const { surveyType, surveyId } = getAsObject(content, 'gating');
  const cookieName = `${cookieNamePrefix}_${surveyId}_${content.id}`;

  const setFormDisplay = ({ req }) => {
    res.locals.contentIdxFormState.displayForm = !get(req, `cookies.${cookieName}`);
  };
  res.locals.contentIdxFormState = {
    displayForm: false,
    setFormDisplay,
  };

  if (surveyType === 'idx') {
    const maxAge = days * 24 * 60 * 60 * 1000;
    const cookie = { name: cookieName, maxAge };
    res.locals.contentIdxFormState.formId = surveyId;
    res.locals.contentIdxFormState.cookie = cookie;
  }
};

module.exports = {
  updateContentIdxFormState,
};
