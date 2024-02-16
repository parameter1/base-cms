const gql = require('graphql-tag');
const { asyncRoute } = require('@parameter1/base-cms-utils');

const localeCountries = gql`
  query LocaleCountries {
    localeCountries {
      id
      name
      flag
    }
  }
`;

module.exports = asyncRoute(async (req, res) => {
  /** @type {import('../middleware').IdentityXRequest} */
  const { identityX } = req;
  const { data } = await identityX.client.query({ query: localeCountries });
  res.json(data.localeCountries);
});
