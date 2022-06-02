const gql = require('graphql-tag');
const { getAsArray } = require('@parameter1/base-cms-object-path');
const getAnsweredQuestionMap = require('../utils/get-answered-question-map');

const SET_OMEDA_BOOLEAN_FIELD_ANSWERS = gql`
mutation SetOmedaBooleanFieldAnswers($input: UpdateAppUserCustomBooleanAnswersMutationInput!) {
  updateAppUserCustomBooleanAnswers(input: $input) { id }
}
`;

/**
 * Sets IdX boolean answers based on the Omeda customer's opt-in status
 */
module.exports = async ({
  identityX,
  user,
  omedaCustomer,
  fields = [],
}) => {
  console.log('setting omeda deployment types for ', user.id, omedaCustomer.id);
  const omedaDeploymentOptInMap = getAsArray(omedaCustomer, 'primaryEmailAddress.optInStatus').reduce((map, { deploymentTypeId, status }) => {
    const optedIn = status.id === 'IN';
    map.set(`${deploymentTypeId}`, optedIn);
    return map;
  }, new Map());

  const answeredQuestionMap = getAnsweredQuestionMap(user);

  const answerMap = new Map();
  fields.forEach((field) => {
    if (answeredQuestionMap.has(field.id)) return;
    const { value: deploymentTypeId } = field.externalId.identifier;
    const optedIn = omedaDeploymentOptInMap.get(deploymentTypeId);
    if (optedIn == null) return;
    answerMap.set(field.id, optedIn);
  });
  if (!answerMap.size) return;

  const answers = [];
  answerMap.forEach((value, fieldId) => {
    answers.push({ fieldId, value });
  });
  await identityX.client.mutate({
    mutation: SET_OMEDA_BOOLEAN_FIELD_ANSWERS,
    variables: { input: { id: user.id, answers } },
    context: { apiToken: identityX.config.getApiToken() },
  });
};
