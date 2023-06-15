const gql = require('graphql-tag');

const mutation = gql`
  mutation StoreInquirySubmission($input: CreateInquirySubmissionMutationInput!) {
    createInquirySubmission(input:$input){
      id
    }
  }
`;

module.exports = async ({
  apollo,
  addresses,
  contentId,
  payload,
  ipAddress,
}) => {
  const input = {
    addresses,
    contentId,
    payload,
    ipAddress,
  };
  return apollo.mutate({ mutation, variables: { input } });
};
