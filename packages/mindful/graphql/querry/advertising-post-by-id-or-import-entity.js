const gql = require('graphql-tag');

module.exports = gql`
query advertisingPostByIdOrImportEntity($_id: ObjectID!, $provider: string, $tenant: string, $types: string) {
advertisingPostByIdOrImportEntity(_id: $_id, provider: $provider, teanant: $tenant, type: $types) {
  _id
  title {
    default
  }
  teaser
  body
  url
  publishedDay
  statusEdge {
    node {
      _id
      label
    }
  }
  featuredImageEdge {
    _id
    node {
      _id
      src {
        url
        settings {
          fpX
          fpY
        }
      }
    }
  }
  companyEdge {
    _id
    node {
      _id
      name {
        default
      }
      logoEdge {
        _id
        node {
          _id
          src {
            url
            settings {
              fpX
              fpY
            }
          }
        }
      }
    }
  }
}
}
`;
