/**
 * @param {object} params
 * @param {import("graphql").DocumentNode|string} params.fragment
 * @param {boolean} [params.throwOnEmpty]
 * @returns {?string}
 */
const extractFragmentName = ({ fragment, throwOnEmpty }) => {
  const pattern = /fragment (.*) on/;
  if (typeof fragment === 'string') return fragment.match(pattern)[1];
  if (fragment && fragment.kind && fragment.kind === 'Document') {
    return fragment.loc.source.body.match(pattern)[1];
  }
  if (throwOnEmpty) throw new Error('Unable to extract fragment');
  return null;
};

/**
 * @param {string} param
 * @returns {?string}
*/
const getOperationName = (string) => {
  const matches = /query\s+([a-z0-9]+)[(]?.+{/gi.exec(string);
  if (matches && matches[1]) return matches[1];
  return undefined;
};

module.exports = {
  extractFragmentName,
  getOperationName,
};
