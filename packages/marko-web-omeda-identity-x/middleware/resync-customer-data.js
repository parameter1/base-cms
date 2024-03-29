const { asyncRoute } = require('@parameter1/base-cms-utils');
const { getAsArray } = require('@parameter1/base-cms-object-path');
const resyncCookie = require('../utils/resync-cookie');
const findEncryptedId = require('../external-id/find-encrypted-customer-id');
const {
  getOmedaCustomerRecord,
  getOmedaLinkedFields,
  updateIdentityX,
} = require('../omeda-data');

const { log } = console;

/**
 * A middleware to resync the IdentityX user data with the Omeda customer data. After syncing data,
 * sets a cookie to prevent resyncs for the configured timeframe.
 */
module.exports = ({
  brandKey,
  omedaGraphQLClientProp = '$omedaGraphQLClient',
}) => asyncRoute(async (req, res, next) => {
  const { identityX, [omedaGraphQLClientProp]: omedaGraphQLClient } = req;
  if (!omedaGraphQLClient) throw new Error(`Unable to load the Omeda GraphQL API from the request using prop ${omedaGraphQLClientProp}`);

  // Load the user and find their external ID
  const { user } = await req.identityX.loadActiveContext();
  if (!user) return next();

  // Only check for the cookie if we have a valid IdX user and Omeda customer
  const encryptedCustomerId = findEncryptedId({ externalIds: getAsArray(user, 'externalIds'), brandKey });
  if (!encryptedCustomerId) return next();

  // If the cookie doesn't exist (or has expired), resync the user data
  const cookie = resyncCookie.parseFrom(req);
  if (cookie) return next();

  // Load the customer data from Omeda and fields from IdentityX
  const [omedaCustomer, omedaLinkedFields] = await Promise.all([
    getOmedaCustomerRecord({ omedaGraphQLClient, encryptedCustomerId }),
    getOmedaLinkedFields({ identityX, brandKey }),
  ]);

  if (!omedaCustomer) {
    log(`Unable to resync Omeda customer using "${encryptedCustomerId}", aborting sync!`);
    return next();
  }

  // Update the IdentityX user record custom select fields with the Omeda user data
  await updateIdentityX({
    identityX,
    brandKey,
    user,
    omedaCustomer,
    omedaLinkedFields,
  }, {
    // Do not update core user fields (name, email, etc) on a verified user.
    updateData: !user.verified,
    // Update any linked custom fields with the relevant values from Omeda.
    updateDemographics: true,
    updateDeploymentTypes: true,
    updateProducts: true,
  });

  // Set the cookie to prevent further resyncs until interval is reached.
  const value = { lastSync: Date.now() };
  const maxAge = identityX.config.get('userResyncInterval', 7 * 24 * 60 * 60 * 1000); // 1 week
  resyncCookie.setTo({ res, value, maxAge });

  return next();
});
