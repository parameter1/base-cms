const gql = require('graphql-tag');
const { asyncRoute } = require('@parameter1/base-cms-utils');

const { isArray } = Array;

const mutation = gql`
  mutation SetPreLoginFields($input: SetAppUserUnverifiedDataMutationInput!) {
    setAppUserUnverifiedData(input: $input) {
      id
    }
  }
`;

module.exports = asyncRoute(async (req, res) => {
  /** @type {import('../middleware').IdentityXRequest} */
  const { identityX, body } = req;
  const {
    email,
    values,
  } = body;

  const regionalConsentAnswers = isArray(values.regionalConsentAnswers)
    ? values.regionalConsentAnswers
    : [];

  const input = {
    ...values,
    regionalConsentAnswers: regionalConsentAnswers
      .map((answer) => ({ policyId: answer.id, given: answer.given })),
    email,
  };
  await identityX.client.mutate({ mutation, variables: { input } });
  const entity = await identityX.generateEntityId();
  return res.json({ ok: true, entity });
});
