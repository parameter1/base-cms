const translations = require('./translations.js');

module.exports = (lang, fieldLabelKey) => {
  if (!translations[lang]) {
    throw new Error(`No translations available for requested language ${lang}!`);
  }
  if (!translations[lang][fieldLabelKey]) {
    throw new Error(`No translations available in ${lang} for requested key ${fieldLabelKey}!`);
  }
  return translations[lang][fieldLabelKey];
};
