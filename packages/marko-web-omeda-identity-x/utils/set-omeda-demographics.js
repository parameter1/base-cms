const gql = require('graphql-tag');
const getAnsweredQuestionMap = require('../utils/get-answered-question-map');

const SET_OMEDA_SELECT_FIELD_ANSWERS = gql`
  mutation SetOmedaSelectFieldAnswers($input: UpdateAppUserCustomSelectAnswersMutationInput!) {
    updateAppUserCustomSelectAnswers(input: $input) { id }
  }
`;

const SET_OMEDA_BOOLEAN_FIELD_ANSWERS = gql`
  mutation SetOmedaBooleanFieldAnswers($input: UpdateAppUserCustomBooleanAnswersMutationInput!) {
    updateAppUserCustomBooleanAnswers(input: $input) { id }
  }
`;

/**
 * Sets IdentityX custom select answers based on the Omeda customer's demographics
 */
module.exports = async ({
  identityX,
  user,
  omedaCustomer,
  fields = [],
}) => {
  // @todo check if option external id still exists or has changed!
  const answeredQuestionMap = getAnsweredQuestionMap(user);

  const omedaCustomerDemoValuesMap = omedaCustomer.demographics
    .reduce((map, { demographic, value, writeInDesc }) => {
      if (!value || !value.id) return map; // skip demos without value IDs
      const id = `${demographic.id}`;
      const ids = map.has(id) ? map.get(id).ids : new Set();
      ids.add(`${value.id}`);
      map.set(id, { ids, writeInDesc });
      return map;
    }, new Map());

  const booleanAnswerMap = new Map();
  const selectAnswerMap = new Map();
  fields.forEach((field) => {
    if (answeredQuestionMap.has(field.id)) return;
    const { value: demoId } = field.externalId.identifier;
    if (!omedaCustomerDemoValuesMap.has(demoId)) return;
    const value = omedaCustomerDemoValuesMap.get(demoId);
    const { ids: valueIdSet, writeInDesc } = value;

    if (field.type === 'select') {
      field.options.forEach((option) => {
        const { externalIdentifier } = option;
        if (!externalIdentifier || !valueIdSet.has(externalIdentifier)) return;
        const ids = selectAnswerMap.has(field.id) ? selectAnswerMap.get(field.id).ids : new Set();
        ids.add(option.id);
        selectAnswerMap.set(field.id, { ids, writeInDesc });
      });
    }

    if (field.type === 'boolean') {
      const { whenTrue, whenFalse } = field;
      // What is this? Why are we setting it twice?
      if (whenTrue.type === 'INTEGER' && valueIdSet.has(`${whenTrue.value}`)) {
        booleanAnswerMap.set(field.id, true);
        return;
      }
      if (whenFalse.type === 'INTEGER' && valueIdSet.has(`${whenFalse.value}`)) {
        booleanAnswerMap.set(field.id, false);
      }
    }
  });

  await (async () => {
    if (!selectAnswerMap.size) return;
    const answers = [];
    selectAnswerMap.forEach((value, fieldId) => {
      const optionIds = [...value.ids];
      answers.push({
        fieldId,
        optionIds,
        ...(value.writeInDesc && {
          writeInValues: optionIds.map(id => ({
            optionId: id,
            value: value.writeInDesc,
          })),
        }),
      });
    });
    await identityX.client.mutate({
      mutation: SET_OMEDA_SELECT_FIELD_ANSWERS,
      variables: { input: { id: user.id, answers } },
      context: { apiToken: identityX.config.getApiToken() },
    });
  })();

  // @todo review
  await (async () => {
    if (!booleanAnswerMap.size) return;
    const answers = [];
    booleanAnswerMap.forEach((value, fieldId) => {
      answers.push({ fieldId, value });
    });
    await identityX.client.mutate({
      mutation: SET_OMEDA_BOOLEAN_FIELD_ANSWERS,
      variables: { input: { id: user.id, answers } },
      context: { apiToken: identityX.config.getApiToken() },
    });
  })();
  // @todo Set cookie!
};
