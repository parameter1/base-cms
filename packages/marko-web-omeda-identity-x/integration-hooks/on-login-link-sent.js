const gql = require('graphql-tag');
const { get, getAsArray } = require('@parameter1/base-cms-object-path');
const isOmedaDeploymentTypeId = require('../external-id/is-deployment-type-id');
const isOmedaDemographicId = require('../external-id/is-demographic-id');

const FIELD_QUERY = gql`
  query GetCustomFields {
    fields {
      edges {
        node {
          id
          name
          type
          active
          externalId {
            id
            namespace { provider tenant type }
            identifier { value }
          }
          ... on SelectField {
            multiple
            options {
              id
              externalIdentifier
            }
          }

          ... on BooleanField {
            whenTrue { type value }
            whenFalse { type value }
          }
        }
      }
    }
  }
`;

const CUSTOMER_QUERY = gql`
  query CustomerByEncryptedId($id: String!) {
    customerByEncryptedId(input: { id: $id, errorOnNotFound: false }) {
      id
      firstName
      lastName
      title
      companyName
      primaryPostalAddress { countryCode regionCode postalCode }
      demographics {
        demographic { id description }
        value { id description }
      }
      primaryEmailAddress {
        optInStatus { deploymentTypeId status { id } }
      }
    }
  }
`;

const SET_OMEDA_DATA = gql`
  mutation SetOmedaData($input: SetAppUserUnverifiedDataMutationInput!) {
    setAppUserUnverifiedData(input: $input) { id }
  }
`;

const SET_OMEDA_BOOLEAN_FIELD_ANSWERS = gql`
  mutation SetOmedaBooleanFieldAnswers($input: UpdateAppUserCustomBooleanAnswersMutationInput!) {
    updateAppUserCustomBooleanAnswers(input: $input) { id }
  }
`;

const SET_OMEDA_SELECT_FIELD_ANSWERS = gql`
  mutation SetOmedaSelectFieldAnswers($input: UpdateAppUserCustomSelectAnswersMutationInput!) {
    updateAppUserCustomSelectAnswers(input: $input) { id }
  }
`;

const getOmedaCustomerRecord = async (omedaGraphQLClient, encryptedCustomerId) => {
  const variables = { id: encryptedCustomerId };
  const { data } = await omedaGraphQLClient.query({ query: CUSTOMER_QUERY, variables });
  return data.customerByEncryptedId;
};

const setOmedaData = async ({ identityX, user, omedaCustomer }) => {
  const input = {
    email: user.email,

    givenName: omedaCustomer.firstName,
    familyName: omedaCustomer.lastName,
    organization: omedaCustomer.companyName,
    organizationTitle: omedaCustomer.title,

    countryCode: get(omedaCustomer, 'primaryPostalAddress.countryCode'),
    regionCode: get(omedaCustomer, 'primaryPostalAddress.regionCode'),
    postalCode: get(omedaCustomer, 'primaryPostalAddress.postalCode'),
  };
  return identityX.client.mutate({
    mutation: SET_OMEDA_DATA,
    variables: { input },
  });
};

const setOmedaDemographics = async ({
  identityX,
  user,
  omedaCustomer,
  omedaLinkedFields,
  answeredQuestionMap,
}) => {
  const omedaCustomerDemoValuesMap = omedaCustomer.demographics
    .reduce((map, { demographic, value }) => {
      if (!value || !value.id) return map; // skip demos without value IDs
      const id = `${demographic.id}`;
      if (!map.has(id)) map.set(id, new Set());
      map.get(id).add(`${value.id}`);
      return map;
    }, new Map());

  const booleanAnswerMap = new Map();
  const selectAnswerMap = new Map();
  omedaLinkedFields.forEach((field) => {
    if (answeredQuestionMap.has(field.id)) return;
    const { value: demoId } = field.externalId.identifier;
    const valueIdSet = omedaCustomerDemoValuesMap.get(demoId);
    if (!valueIdSet) return;

    if (field.type === 'select') {
      field.options.forEach((option) => {
        const { externalIdentifier } = option;
        if (!externalIdentifier || !valueIdSet.has(externalIdentifier)) return;
        if (!selectAnswerMap.has(field.id)) selectAnswerMap.set(field.id, new Set());
        selectAnswerMap.get(field.id).add(option.id);
      });
    }

    if (field.type === 'boolean') {
      const { whenTrue, whenFalse } = field;
      if (whenTrue.type === 'INTEGER' && valueIdSet.has(`${whenTrue.value}`)) {
        booleanAnswerMap.set(field.id, true);
        return;
      }
      if (whenFalse.type === 'INTEGER' && valueIdSet.has(`${whenFalse.value}`)) {
        booleanAnswerMap.set(field.id, false);
      }
    }
  });

  await Promise.all([
    (async () => {
      if (!selectAnswerMap.size) return;
      const answers = [];
      selectAnswerMap.forEach((optionIdSet, fieldId) => {
        answers.push({ fieldId, optionIds: [...optionIdSet] });
      });
      await identityX.client.mutate({
        mutation: SET_OMEDA_SELECT_FIELD_ANSWERS,
        variables: { input: { id: user.id, answers } },
        context: { apiToken: identityX.config.getApiToken() },
      });
    })(),
    (async () => {
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
    })(),
  ]);
};

const setOmedaDeploymentTypes = async ({
  identityX,
  user,
  omedaCustomer,
  omedaLinkedFields,
  answeredQuestionMap,
}) => {
  const omedaDeploymentOptInMap = getAsArray(omedaCustomer, 'primaryEmailAddress.optInStatus').reduce((map, { deploymentTypeId, status }) => {
    const optedIn = status.id === 'IN';
    map.set(`${deploymentTypeId}`, optedIn);
    return map;
  }, new Map());

  const answerMap = new Map();
  omedaLinkedFields.forEach((field) => {
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

module.exports = async ({
  brandKey,
  omedaGraphQLProp = '$omedaGraphQLClient',
  idxOmedaRapidIdentifyProp = '$idxOmedaRapidIdentify',

  req,
  service: identityX,
  user,
}) => {
  const omedaGraphQLClient = req[omedaGraphQLProp];
  if (!omedaGraphQLClient) throw new Error(`Unable to load the Omeda GraphQL API from the request using prop ${omedaGraphQLProp}`);
  const idxOmedaRapidIdentify = req[idxOmedaRapidIdentifyProp];
  if (!idxOmedaRapidIdentify) throw new Error(`Unable to find the IdentityX+Omeda rapid identifier on the request using ${idxOmedaRapidIdentifyProp}`);

  // get omeda customer id (via rapid identity) and load omeda custom field data
  const [{ data }, { encryptedCustomerId }] = await Promise.all([
    identityX.client.query({ query: FIELD_QUERY }),
    idxOmedaRapidIdentify({
      user: user.verified ? user : { id: user.id, email: user.email },
    }),
  ]);

  const omedaLinkedFields = {
    demographic: [],
    deploymentType: [],
  };
  getAsArray(data, 'fields.edges').forEach((edge) => {
    const { node: field } = edge;
    const { externalId } = field;
    if (!field.active || !externalId) return;
    if (isOmedaDemographicId({ externalId, brandKey })) {
      omedaLinkedFields.demographic.push(field);
    }
    if (field.type === 'boolean' && isOmedaDeploymentTypeId({ externalId, brandKey })) {
      omedaLinkedFields.deploymentType.push(field);
    }
  });

  const answeredQuestionMap = new Map();
  user.customSelectFieldAnswers.forEach((select) => {
    if (!select.hasAnswered) return;
    answeredQuestionMap.set(select.field.id, true);
  });
  user.customBooleanFieldAnswers.forEach((boolean) => {
    if (!boolean.hasAnswered) return;
    answeredQuestionMap.set(boolean.field.id, true);
  });

  const hasAnsweredAllOmedaQuestions = omedaLinkedFields
    .demographic.every(field => answeredQuestionMap.has(field.id))
    && omedaLinkedFields
      .deploymentType.every(field => answeredQuestionMap.has(field.id));

  if (user.verified && user.hasAnsweredAllOmedaQuestions) {
    return;
  }

  // find the omeda customer record to "prime" the identity-x user.
  const omedaCustomer = await getOmedaCustomerRecord(omedaGraphQLClient, encryptedCustomerId);
  const promises = [];
  if (!user.verified) promises.push(setOmedaData({ identityX, user, omedaCustomer }));
  if (!hasAnsweredAllOmedaQuestions) {
    promises.push((async () => {
      await setOmedaDemographics({
        identityX,
        user,
        omedaCustomer,
        omedaLinkedFields: omedaLinkedFields.demographic,
        answeredQuestionMap,
      });
      await setOmedaDeploymentTypes({
        identityX,
        user,
        omedaCustomer,
        omedaLinkedFields: omedaLinkedFields.deploymentType,
        answeredQuestionMap,
      });
    })());
  }
  await Promise.all(promises);
};
