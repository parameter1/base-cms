const gql = require('graphql-tag');
const imageFragment = require('../fragments/image');

module.exports = gql`

query MarkoWebStoryPage($input: PublishedStoryInput!) {
  publishedStory(input: $input) {
    id
    title
    teaser
    body
    primaryImage {
      ...ImageFragment
    }
  }
}

${imageFragment}

`;
