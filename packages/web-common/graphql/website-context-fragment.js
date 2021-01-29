const gql = require('graphql-tag');

module.exports = gql`

fragment MarkoWebsiteContextFragment on WebsiteSite {
  id
  name
  shortName
  description
  host
  origin
  imageHost
  assetHost
  date {
    timezone
    format
    locale
  }
  language {
    code
    primaryCode
    subCode
  }
}

`;
