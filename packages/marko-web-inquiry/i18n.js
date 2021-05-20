import translations from './translations';

export default (lang, fieldLabelKey) => {
  const keys = Object.keys(translations);
  if (!keys.includes(lang)) {
    throw new Error(`No translations available for requested language ${lang}!`);
  }
  if (!translations[lang][fieldLabelKey]) {
    throw new Error(`No translations available in ${lang} for requested key ${fieldLabelKey}!`);
  }
  return translations[lang][fieldLabelKey];
};
