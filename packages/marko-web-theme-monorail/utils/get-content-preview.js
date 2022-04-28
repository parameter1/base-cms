const cheerio = require('cheerio');

module.exports = ({ body, selector } = {}) => {
  if (!body) return '';
  const $ = cheerio.load(body);
  return $.html(selector);
};
