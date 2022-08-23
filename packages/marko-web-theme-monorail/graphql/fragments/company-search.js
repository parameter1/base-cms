const gql = require('graphql-tag');

module.exports = gql`

fragment CompanySearchFragment on Content {
  id
  shortName
  siteContext {
    path
  }
}

`;
