const gql = require('graphql-tag');

module.exports = gql`

extend type Mutation {
  createContentDownloadSubmission(input: CreateContentDownloadSubmissionMutationInput!): ContentDownloadSubmission!
}

type ContentDownloadSubmission {
  id: ObjectID! @projection(localField: "_id") @value(localField: "_id")
  contentId: Int! @projection
  payload: JSON @projection
  created: Date @projection
}

input CreateContentDownloadSubmissionMutationInput {
  contentId: Int!
  userId: String
  ipAddress: String
  payload: JSON!
}

`;
