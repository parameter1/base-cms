const gql = require('graphql-tag');
const { get, getAsArray } = require('@parameter1/base-cms-object-path');
const isOmedaDemographicId = require('../external-id/is-demographic-id');

const FIELD_QUERY = gql`
  query GetCustomFields {
    fields {
      edges {
        node {
          id
          name
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
    }
  }
`;

const SET_OMEDA_DATA = gql`
  mutation SetOmedaData($input: SetAppUserUnverifiedDataMutationInput!) {
    setAppUserUnverifiedData(input: $input) { id }
  }
`;

const SET_OMEDA_DEMOGRAPHIC_DATA = gql`
  mutation SetOmedaDemographicData($input: UpdateAppUserCustomSelectAnswersMutationInput!) {
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

  const answerMap = new Map();
  omedaLinkedFields.forEach((field) => {
    if (answeredQuestionMap.has(field.id)) return;
    const { value: demoId } = field.externalId.identifier;
    const valueIdSet = omedaCustomerDemoValuesMap.get(demoId);
    if (!valueIdSet) return;
    field.options.forEach((option) => {
      const { externalIdentifier } = option;
      if (!externalIdentifier || !valueIdSet.has(externalIdentifier)) return;
      if (!answerMap.has(field.id)) answerMap.set(field.id, new Set());
      answerMap.get(field.id).add(option.id);
    });
  });

  if (answerMap.size) {
    const answers = [];
    answerMap.forEach((optionIdSet, fieldId) => {
      answers.push({ fieldId, optionIds: [...optionIdSet] });
    });
    await identityX.client.mutate({
      mutation: SET_OMEDA_DEMOGRAPHIC_DATA,
      variables: { input: { id: user.id, answers } },
      context: { apiToken: identityX.config.getApiToken() },
    });
  }
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
  const idxRapidIdentify = req[idxOmedaRapidIdentifyProp];
  if (!idxRapidIdentify) throw new Error(`Unable to find the IdentityX+Omeda rapid identifier on the request using ${idxOmedaRapidIdentifyProp}`);

  // get omeda customer id (via rapid identity) and load omeda custom field data
  const [{ data }, { encryptedCustomerId }] = await Promise.all([
    identityX.client.query({ query: FIELD_QUERY }),
    idxRapidIdentify({
      user: user.verified ? user : { id: user.id, email: user.email },
    }),
  ]);

  const omedaLinkedFields = getAsArray(data, 'fields.edges')
    .map(edge => edge.node)
    .filter((field) => {
      if (!field.active || !field.externalId) return false;
      return isOmedaDemographicId({ externalId: field.externalId, brandKey });
    });

  const answeredQuestionMap = user.customSelectFieldAnswers.reduce((map, select) => {
    if (!select.hasAnswered) return map;
    map.set(select.field.id, true);
    return map;
  }, new Map());

  const hasAnsweredAllOmedaQuestions = omedaLinkedFields
    .every(field => answeredQuestionMap.has(field.id));
  if (user.verified && user.hasAnsweredAllOmedaQuestions) {
    return;
  }

  // find the omeda customer record to "prime" the identity-x user.
  const omedaCustomer = await getOmedaCustomerRecord(omedaGraphQLClient, encryptedCustomerId);
  const promises = [];
  if (!user.verified) promises.push(setOmedaData({ identityX, user, omedaCustomer }));
  if (!hasAnsweredAllOmedaQuestions) {
    promises.push(setOmedaDemographics({
      identityX,
      user,
      omedaCustomer,
      omedaLinkedFields,
      answeredQuestionMap,
    }));
  }
  await Promise.all(promises);
};
