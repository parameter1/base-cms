const { asyncRoute } = require('@parameter1/base-cms-utils');
const gql = require('graphql-tag');
const createError = require('http-errors');
const template = require('../templates/taxonomy');

const query = gql`
  query WithTaxonomy($input: TaxonomyQueryInput!) {
    taxonomy(input: $input) {
      id
      name
      type
      description
    }
  }
`;

module.exports = (app) => {
  app.get('/t/:id(\\d+)', asyncRoute(async (req, res) => {
    const { apollo } = res.locals;
    const id = parseInt(req.params.id, 10);
    const input = { id };
    const variables = { input };
    const { data } = await apollo.query({ query, variables });
    const { taxonomy } = data;
    if (!taxonomy) throw createError(404, `No taxonomy term was found for ID '${id}'`);

    return res.marko(template, { ...taxonomy });
  }));
};
