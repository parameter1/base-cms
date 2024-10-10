const { get } = require('@parameter1/base-cms-object-path');

const cookieNamePrefix = '__idx_form';
const days = 0;

const contentDownloadState = ({ res, content }) => {
  // Handle setting of contentDownloadState Object
  const surveyId = 'content-download';
  const cookieName = `${cookieNamePrefix}_${surveyId}_${content.id}`;

  const setFormDisplay = ({ req }) => {
    res.locals.contentDownloadState.displayForm = !get(req, `cookies.${cookieName}`);
  };
  res.locals.contentDownloadState = {
    displayForm: false,
    setFormDisplay,
  };
  const maxAge = days * 24 * 60 * 60 * 1000;
  const cookie = { name: cookieName, maxAge };
  res.locals.contentDownloadState.formId = surveyId;
  res.locals.contentDownloadState.cookie = cookie;
};

module.exports = {
  contentDownloadState,
};
