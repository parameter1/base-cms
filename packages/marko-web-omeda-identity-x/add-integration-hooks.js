const gql = require('graphql-tag');
const { get, getAsArray } = require('@parameter1/base-cms-object-path');
const olyticsCookie = require('@parameter1/base-cms-marko-web-omeda/olytics/customer-cookie');
const findEncryptedId = require('./external-id/find-encrypted-customer-id');
const isOmedaDemographicId = require('./external-id/is-demographic-id');

const rapidIdentify = require('./rapid-identify');

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
      primaryPostalAddress {
        countryCode
        regionCode
        postalCode
      }
      demographics {
        demographic {
          id
          description
        }
        value {
          id
          description
        }
      }
    }
  }
`;

const SET_OMEDA_DATA = gql`
  mutation SetOmedaData($input: SetAppUserUnverifiedDataMutationInput!) {
    setAppUserUnverifiedData(input: $input) {
      id
    }
  }
`;

const SET_OMEDA_DEMOGRAPHIC_DATA = gql`
  mutation SetOmedaDemographicData($input: UpdateAppUserCustomSelectAnswersMutationInput!) {
    updateAppUserCustomSelectAnswers(input: $input) {
      id
    }
  }
`;

const getOmedaCustomerRecord = async (omedaGraphQL, encryptedCustomerId) => {
  const variables = { id: encryptedCustomerId };
  const { data } = await omedaGraphQL.query({ query: CUSTOMER_QUERY, variables });
  return data.customerByEncryptedId;
};

/**
 *
 * @param {object} params
 * @param {IdentityXConfiguration} params.idxConfig
 */
module.exports = ({
  idxConfig,
  brandKey,
  productId,
  omedaGraphQLProp = '$omeda',
} = {}) => {
  if (!idxConfig) throw new Error('The IdentityX configuration instances is required to add Omeda+IdentityX integration hooks.');
  if (!brandKey) throw new Error('An Omeda brand key is required to add Omeda+IdentityX integration hooks.');
  if (!productId) throw new Error('An Omeda rapid identification product ID is required to add Omeda+IdentityX integration hooks.');
  idxConfig.addHook({
    name: 'onLoginLinkSent',
    shouldAwait: false,
    fn: async ({ req, service, user }) => {
      // "prepare" the user record. would need omeda credentials
      const omedaGraphQL = req[omedaGraphQLProp];
      if (!omedaGraphQL) throw new Error(`Unable to load the Omeda GraphQL API from the request using prop ${omedaGraphQLProp}`);

      // get omeda customer id (via rapid identity) and load omeda custom field data
      const [{ data }, { encryptedCustomerId }] = await Promise.all([
        service.client.query({ query: FIELD_QUERY }),
        rapidIdentify({
          brandKey,
          productId,
          appUser: user.verified ? user : { id: user.id, email: user.email },
          identityX: service,
          omedaGraphQL,
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
      const omedaCustomer = await getOmedaCustomerRecord(omedaGraphQL, encryptedCustomerId);
      const omedaCustomerDemoValuesMap = omedaCustomer.demographics
        .reduce((map, { demographic, value }) => {
          if (!value || !value.id) return map; // skip demos without value IDs
          const id = `${demographic.id}`;
          if (!map.has(id)) map.set(id, new Set());
          map.get(id).add(`${value.id}`);
          return map;
        }, new Map());

      if (!user.verified) {
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
        await service.client.mutate({
          mutation: SET_OMEDA_DATA,
          variables: { input },
        });
      }

      if (!hasAnsweredAllOmedaQuestions) {
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
          await service.client.mutate({
            mutation: SET_OMEDA_DEMOGRAPHIC_DATA,
            variables: { input: { id: user.id, answers } },
            context: { apiToken: service.config.getApiToken() },
          });
        }
      }
    },
  });

  idxConfig.addHook({
    name: 'onAuthenticationSuccess',
    shouldAwait: true,
    fn: async ({ user, res }) => {
      const encryptedId = findEncryptedId({ externalIds: user.externalIds, brandKey });
      if (!encryptedId) return;
      olyticsCookie.setTo(res, encryptedId);
    },
  });

  idxConfig.addHook({
    name: 'onUserProfileUpdate',
    shouldAwait: false,
    fn: async ({ user, service, req }) => {
      const omedaGraphQL = req[omedaGraphQLProp];
      if (!omedaGraphQL) throw new Error(`Unable to load the Omeda GraphQL API from the request using prop ${omedaGraphQLProp}`);
      rapidIdentify({
        brandKey,
        productId,
        appUser: user,
        identityX: service,
        omedaGraphQL,
      });
    },
  });

  idxConfig.addHook({
    name: 'onLogout',
    shouldAwait: true,
    fn: async ({ res }) => {
      // clear the olytics user cookie.
      olyticsCookie.clearFrom(res);
    },
  });

  return idxConfig;
};
