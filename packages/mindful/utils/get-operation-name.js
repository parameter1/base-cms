/**
 * @param {string} param
 * @returns {?string}
*/
module.exports = (string) => {
  console.log('asdgasdgadsg; ', string);
  const matches = /query\s+([a-z0-9]+)[(]?.+{/gi.exec(string);
  if (matches && matches[1]) return matches[1];
  return undefined;
};
