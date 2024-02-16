const gql = require('graphql-tag');
const { asyncRoute } = require('@parameter1/base-cms-utils');

const localeRegions = gql`
  query localeRegions {
    localeRegions {
      id
      code
      name
      country {
        id
      }
    }
  }
`;

module.exports = asyncRoute(async (req, res) => {
  /** @type {import('../middleware').IdentityXRequest} */
  const { identityX } = req;
  const { data } = await identityX.client.query({ query: localeRegions });
  res.json(data.localeRegions);
});
