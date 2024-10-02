const gql = require('graphql-tag');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const { getAsArray, getAsObject } = require('@parameter1/base-cms-object-path');
const userFragment = require('../api/fragments/active-user');
const callHooksFor = require('../utils/call-hooks-for');

const mutation = gql`
  mutation UpdateUserProfile($input: UpdateOwnAppUserMutationInput!) {
    updateOwnAppUser(input: $input) {
      ...ActiveUserFragment
    }
  }

  ${userFragment}
`;

const consentAnswers = gql`
  mutation SetAppUserRegionalConsent($input: SetAppUserRegionalConsentMutationInput!) {
    setAppUserRegionalConsent(input: $input) {
      id
    }
  }
`;

const customBooleanFieldsMutation = gql`
  mutation SetAppUserCustomBooleanFields($input: UpdateOwnAppUserCustomBooleanAnswersMutationInput!) {
    updateOwnAppUserCustomBooleanAnswers(input: $input) {
      id
    }
  }
`;

const customSelectFieldsMutation = gql`
  mutation SetAppUserCustomSelectFields($input: UpdateOwnAppUserCustomSelectAnswersMutationInput!) {
    updateOwnAppUserCustomSelectAnswers(input: $input) {
      id
    }
  }
`;

const customTextFieldsMutation = gql`
  mutation SetAppUserCustomTextFields($input: UpdateOwnAppUserCustomTextAnswersMutationInput!) {
    updateOwnAppUserCustomTextAnswers(input: $input) {
      id
    }
  }
`;

module.exports = asyncRoute(async (req, res) => {
  /** @type {import('../middleware').IdentityXRequest} */
  const { identityX, body } = req;
  const {
    givenName,
    familyName,
    organization,
    organizationTitle,
    countryCode,
    regionCode,
    postalCode,
    city,
    street,
    addressExtra,
    mobileNumber,
    phoneNumber,
    receiveEmail,
    regionalConsentAnswers,
    customBooleanFieldAnswers,
    customSelectFieldAnswers,
    customTextFieldAnswers,
    additionalEventData = {},
  } = body;
  const input = {
    givenName,
    familyName,
    organization,
    organizationTitle,
    countryCode,
    regionCode,
    postalCode,
    city,
    street,
    addressExtra,
    mobileNumber,
    phoneNumber,
    receiveEmail,
  };

  // get identity-x.forms custom-select question ids to append to ActiveCustomQuestionIds
  const customFormFieldIds = Object.values(getAsObject(identityX, 'config.options.forms')).reduce((questions, form) => {
    // loop over the fieldRows
    const newQuestions = getAsArray(form, 'fieldRows').reduce((q, row) => {
      // push the custom-select form being used with those forms to accaptable profile inputs
      // @todo fiugre out if other types should also make it... custom-boolean specifically.
      row.forEach((question) => {
        if (question.type === 'custom-select') q.push(question.id);
      });
      return q;
    }, []);
    return questions.concat(newQuestions);
  }, []);

  const customFieldIds = [
    ...new Set([
      ...getAsArray(identityX, 'config.options.activeCustomFieldIds'),
      ...customFormFieldIds,
    ]),
  ];

  const answers = regionalConsentAnswers
    .map((answer) => ({ policyId: answer.id, given: answer.given }));

  if (answers.length) {
    await identityX.client.mutate({ mutation: consentAnswers, variables: { input: { answers } } });
  }

  if (customBooleanFieldAnswers.length) {
    // only update custom questions when there some :)
    const customBooleanFieldsInput = customBooleanFieldAnswers.map((fieldAnswer) => ({
      fieldId: fieldAnswer.field.id,
      // can either be true, false or null. convert null to false.
      // the form submit is effectively answers the question.
      value: Boolean(fieldAnswer.answer),
    })).filter(
      customFieldIds.length > 0
        ? ({ fieldId }) => customFieldIds.includes(fieldId)
        : () => true,
    );
    await identityX.client.mutate({
      mutation: customBooleanFieldsMutation,
      variables: { input: { answers: customBooleanFieldsInput } },
    });
  }

  if (customSelectFieldAnswers.length) {
    // only update custom questions when there some :)
    const customSelectFieldsInput = customSelectFieldAnswers.map((fieldAnswer) => ({
      fieldId: fieldAnswer.field.id,
      optionIds: fieldAnswer.answers.map(({ id }) => id),
      writeInValues: fieldAnswer.answers.reduce((arr, { id, writeInValue }) => ([
        ...arr,
        ...(writeInValue ? [{ optionId: id, value: writeInValue }] : []),
      ]), []),
    })).filter(
      customFieldIds.length > 0
        ? ({ fieldId }) => customFieldIds.includes(fieldId)
        : () => true,
    );
    await identityX.client.mutate({
      mutation: customSelectFieldsMutation,
      variables: { input: { answers: customSelectFieldsInput } },
    });
  }

  if (customTextFieldAnswers.length) {
    // only update custom questions when there some :)
    const customTextFieldsInput = customTextFieldAnswers.map((fieldAnswer) => ({
      fieldId: fieldAnswer.field.id,
      // the form submit is effectively answers the question.
      value: fieldAnswer.value,
    })).filter(
      customFieldIds.length > 0
        ? ({ fieldId }) => customFieldIds.includes(fieldId)
        : () => true,
    );
    await identityX.client.mutate({
      mutation: customTextFieldsMutation,
      variables: { input: { answers: customTextFieldsInput } },
    });
  }

  const { data } = await identityX.client.mutate({ mutation, variables: { input } });
  const { updateOwnAppUser: user } = data;
  await callHooksFor(identityX, 'onUserProfileUpdate', {
    additionalEventData,
    ...(additionalEventData || {}),
    req,
    user,
  });
  const entity = await identityX.generateEntityId({ userId: user.id });
  res.json({
    ok: true,
    user,
    additionalEventData,
    entity,
  });
});
