const gql = require('graphql-tag');

module.exports = gql`

extend type Mutation {
  createContentAccessSubmission(input: CreateContentAccessSubmissionMutationInput!): ContentAccessSubmission!
}

type ContentAccessSubmission {
  id: ObjectID! @projection(localField: "_id") @value(localField: "_id")
  contentId: Int! @projection
  payload: JSON @projection
  created: Date @projection
}

input CreateContentAccessSubmissionMutationInput {
  contentId: Int!
  userId: String
  ipAddress: String
  payload: JSON!
}

`;
