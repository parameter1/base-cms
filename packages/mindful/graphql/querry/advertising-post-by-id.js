const gql = require('graphql-tag');
const defaultFragment = require('../fragments/advertising-post-by-id');

module.exports = gql`
query advertisingPostById($_id: ObjectID!) {
advertisingPostById(_id: $_id) {
  ...${defaultFragment}
}
}
`;
