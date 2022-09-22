const { asyncRoute } = require('@parameter1/base-cms-utils');

const isEmpty = v => v == null || v === '';

/**
 * Determines if user input is required.
 *
 * @param {*} service The IdentityX service instance
 * @returns Boolean
 */
const isInputRequired = async (service) => {
  const { user, application } = await service.loadActiveContext({ forceQuery: true });

  // Check that all requires fields (from IdentityX config) are set
  const requiredFields = service.config.getRequiredServerFields();
  const requiresUserInput = user ? requiredFields.some(key => isEmpty(user[key])) : false;
  if (requiresUserInput) return true;

  // Check that the user does not need to reverify their profile
  const mustReverify = Boolean(user.mustReVerifyProfile);
  if (mustReverify) return true;

  // Check that all regional consent policies are agreed to
  const { regionalConsentPolicies } = application.organization;
  const matchingPolicies = regionalConsentPolicies.filter((policy) => {
    const countryCodes = policy.countries.map(country => country.id);
    return countryCodes.includes(user.countryCode);
  });
  const policiesAnswered = user.regionalConsentAnswers
    .reduce((o, answer) => ({ ...o, [answer.id]: true }), {});
  const hasRequiredAnswers = matchingPolicies.length
    ? matchingPolicies.every(policy => policiesAnswered[policy.id])
    : true;

  return !hasRequiredAnswers;
};

module.exports = asyncRoute(async (req, res, next) => {
  // Only handle if Auth0 & IdentityX are loaded
  if (!req.oidc || !req.identityX) throw new Error('Auth0 and IdentityX must be enabled!');

  const { identityX: idxSvc, originalUrl } = req;
  const { user } = req.oidc;

  // the Auth0 user has been logged out, log out the IdentityX user.
  if (!user && idxSvc.token) {
    await idxSvc.logoutAppUser();
  }

  if (await isInputRequired(idxSvc)) {
    const profile = idxSvc.config.getEndpointFor('profile');
    const url = [
      profile,
      ...(originalUrl && ![profile, '/'].includes(originalUrl) ? [
        `?returnTo=${encodeURIComponent(originalUrl)}`,
      ] : []),
    ].join('');
    res.redirect(302, url);
  } else {
    next();
  }
});
