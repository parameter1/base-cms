const gql = require('graphql-tag');

module.exports = gql`

fragment LatestPodcastBlockContentFragment on Content {
  id
  type
  shortName
  siteContext {
    path
  }
}

`;
