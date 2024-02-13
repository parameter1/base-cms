const gql = require('graphql-tag');
const { asyncRoute } = require('@parameter1/base-cms-utils');

const mutation = gql`
  mutation SetPreLoginFields($input: SetAppUserUnverifiedDataMutationInput!) {
    setAppUserUnverifiedData(input: $input) {
      id
    }
  }
`;

const forceProfileReVerificationUser = gql`
  mutation ForceRevalidateAppUser($input: ForceProfileReVerificationAppUserMutationInput!) {
    forceProfileReVerificationAppUser(input: $input) {
      id
      forceProfileReVerification
    }
  }
`;

module.exports = asyncRoute(async (req, res) => {
  /** @type {import('../middleware').IdentityXRequest} */
  const { identityX, body } = req;
  const {
    email,
    source,
    redirectTo,
    additionalEventData = {},
  } = body;
  let appUser = await identityX.loadAppUserByEmail(email);

  // Check for required creation fields
  const required = identityX.config.getRequiredCreateFields();
  if (required.length) {
    // If we don't have a user, or the user is missing some of the required fields
    if (!appUser || (appUser && !required.every((key) => appUser[key]))) {
      additionalEventData.createdNewUser = true;
      // And they weren't presented in the login request, require them.
      if (!required.every((key) => body[key])) {
        return res.status(400).json({ ok: false, requiresUserInput: true });
      }
    }
  }

  if (!appUser || (appUser && !required.every((key) => appUser[key]))) {
    // Create the user.
    appUser = await identityX.createAppUser({ email });
    additionalEventData.createdNewUser = true;
  }

  if (additionalEventData.forceProfileReVerification) {
    const { id } = appUser;
    await identityX.client.mutate({
      mutation: forceProfileReVerificationUser,
      variables: { input: { id } },
    });
  }

  // Set the fields as unverified app data and continue login.
  if (required.length && additionalEventData.createdNewUser) {
    const regionalConsentAnswers = Array.isArray(body.regionalConsentAnswers)
      ? body.regionalConsentAnswers
      : [];
    const input = {
      ...(required.reduce((obj, key) => ({ ...obj, [key]: body[key] }), {})),
      regionalConsentAnswers: regionalConsentAnswers
        .map((answer) => ({ policyId: answer.id, given: answer.given })),
      email,
    };
    await identityX.client.mutate({ mutation, variables: { input } });
  }

  // Refresh the user for verification/new field state
  if (additionalEventData.forceProfileReVerification || additionalEventData.createdNewUser) {
    appUser = await identityX.loadAppUserByEmail(email);
  }

  // Send login link.
  await identityX.sendLoginLink({
    appUser,
    source,
    redirectTo,
    additionalEventData,
  });
  const returnedAppUser = { id: appUser.id, email: appUser.email };
  return res.json({ ok: true, additionalEventData, appUser: returnedAppUser });
});
