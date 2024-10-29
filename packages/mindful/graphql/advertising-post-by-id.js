const gql = require('graphql-tag');

module.exports = gql`
query advertisingPostById($_id: ObjectID!) {
advertisingPostById(_id: $_id) {
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
