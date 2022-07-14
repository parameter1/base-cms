const gql = require('graphql-tag');
const { getAsArray } = require('@parameter1/base-cms-object-path');
const getAnsweredQuestionMap = require('./get-answered-question-map');
const isOmedaProductId = require('../external-id/is-product-id');

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
  brandKey,
  user,
  omedaCustomer,
  fields = [],
}) => {
  const statusMap = getAsArray(omedaCustomer, 'subscriptions').reduce((map, { product, receive }) => {
    map.set(`${product.id}`, receive);
    return map;
  }, new Map());

  const answeredQuestionMap = getAnsweredQuestionMap(user);
  const answerMap = fields
    .filter(field => isOmedaProductId({ externalId: field.externalId, brandKey }))
    .reduce((map, field) => {
      // Only set values that haven't already been answered.
      if (answeredQuestionMap.has(field.id)) return map;
      const { value } = field.externalId.identifier;
      const receive = statusMap.get(`${value}`);
      if (receive == null) return map;
      map.set(field.id, receive);
      return map;
    }, new Map());
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
