const { get, getAsObject } = require('@parameter1/base-cms-object-path');

const cookieNamePrefix = '__idx_form';
// default is one day
const maxAge = process.env.IDX_CONTENT_ACCESS_MAXAGE
  ? Number(process.env.IDX_CONTENT_ACCESS_MAXAGE)
  : (24 * 60 * 60 * 1000);

const contentAccessState = ({ res, content }) => {
  // Handle setting of contentAccessState Object
  const { surveyType, surveyId } = getAsObject(content, 'gating');
  const cookieName = `${cookieNamePrefix}_${surveyId}_${content.id}`;

  const setFormDisplay = ({ req }) => {
    res.locals.contentAccessState.displayForm = !get(req, `cookies.${cookieName}`);
  };
  res.locals.contentAccessState = {
    displayForm: false,
    setFormDisplay,
  };

  if (surveyType === 'idx') {
    const cookie = { name: cookieName, maxAge };
    res.locals.contentAccessState.formId = surveyId;
    res.locals.contentAccessState.cookie = cookie;
  }
};

module.exports = {
  contentAccessState,
};
