/**
 * @param {object} params
 * @param {import("graphql").DocumentNode|string} params.fragment
 * @param {boolean} [params.throwOnEmpty]
 * @returns {?string}
 */
module.exports = ({ fragment, throwOnEmpty }) => {
  const pattern = /fragment (.*) on/;
  if (typeof fragment === 'string') return fragment.match(pattern)[1];
  if (fragment && fragment.kind && fragment.kind === 'Document') {
    return fragment.loc.source.body.match(pattern)[1];
  }
  if (throwOnEmpty) throw new Error('Unable to extract fragment');
  return null;
};
