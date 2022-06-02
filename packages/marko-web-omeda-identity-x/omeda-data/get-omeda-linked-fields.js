const gql = require('graphql-tag');
const { getAsArray } = require('@parameter1/base-cms-object-path');
const isOmedaDeploymentTypeId = require('../external-id/is-deployment-type-id');
const isOmedaDemographicId = require('../external-id/is-demographic-id');

const query = gql`
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

module.exports = async ({
  identityX,
  brandKey,
}) => {
  const { data } = await identityX.client.query({ query });

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

  return omedaLinkedFields;
};
