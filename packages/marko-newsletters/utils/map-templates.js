const { getAsArray } = require('@parameter1/base-cms-object-path');
const gql = require('graphql-tag');

const query = gql`

query MarkoNewslettersList($campaignsBefore: Date, $campaignsAfter: Date) {
  emailNewsletters(input: { sort: { field: name, order: asc }, pagination: { limit: 200 } }) {
    edges {
      node {
        id
        name
        description
        alias
        site {
          id
          name
          date {
            timezone
          }
        }
        campaigns(input: {
          scheduledBefore: $campaignsBefore
          scheduledAfter: $campaignsAfter
          pagination: { limit: 100 }
        }) {
          edges {
            node {
              id
              name
              deploymentDate
              scheduled
            }
          }
        }
      }
    }
  }
}

`;

module.exports = async (apollo, { templates }) => {
  const campaignsBefore = Date.now();
  const campaignsAfter = campaignsBefore - (365 * 24 * 60 * 60 * 1000); // less one year
  const variables = { campaignsBefore, campaignsAfter };
  const { data } = await apollo.query({ query, variables });

  const allNewsletters = getAsArray(data, 'emailNewsletters.edges').map((edge) => {
    const node = { ...edge.node };
    node.templates = templates.filter(t => t.alias === node.alias).map(t => t.key);
    node.campaigns = getAsArray(node, 'campaigns.edges').map(campaignEdge => ({ ...campaignEdge.node }));
    [node.latestCampaign] = node.campaigns;
    return node;
  });
  const newsletters = allNewsletters.filter(newsletter => newsletter.site);
  const invalidNewsletters = allNewsletters.filter(newsletter => !newsletter.site);

  const aliases = newsletters.map(n => n.alias);
  const staticTemplates = templates.filter(t => !aliases.includes(t.alias)).map(t => t.key);

  invalidNewsletters.forEach((newsletter) => {
    process.emitWarning(`No site ID is assigned to ${newsletter.name} (${newsletter.id})`);
  });

  return { newsletters, staticTemplates };
};
