const gql = require('graphql-tag');

module.exports = gql`
fragment SitemapPublishedContentFragment on Content {
  id
  published
  shortName
  siteContext {
    path
  }
}

`;
