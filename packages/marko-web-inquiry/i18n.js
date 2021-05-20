import translations from './translations';

let value = '';
function i18n(lang, fieldLabelKey) {
  const keys = Object.keys(translations);
  if (keys.includes(lang)) {
    value = lang[fieldLabelKey];
  } else {
    throw new Error('LANGUAGE STRING MUST BE PROVIDED');
  }
  return value;
}


export default i18n;
